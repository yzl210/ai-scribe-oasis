import boss from './boss';
import { prisma } from '../prisma';
import { generateResponse } from '../openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { emitNoteUpdated } from '../routes/notes';
import { Form, FormMapSchema, FORMS } from '@ai-scribe-oasis/shared/forms';
import { z, ZodObject, ZodTypeAny } from 'zod';

const QUEUE = 'generate';

const PROMPT = `
You are a clinical documentation assistant helping home health nurses complete OASIS-E assessments based on encounter transcripts.
TASK: Form Filling – Using only evidence from the transcript, choose the correct code for every item in the form. If a field is not addressed, leave it as null.
`;

type GenerateJob = {
    noteId: number;
    form: Form;
    transcript: string;
}

export async function enqueueGeneration(noteId: number, form: Form, transcript: string) {
    await boss.send(QUEUE, { noteId, form, transcript });
}

type Responses<T> = T extends ZodObject<infer Shape>
    ? { [K in keyof Shape]: Responses<Shape[K]> }
    : string;

async function buildResponses<
    T extends ZodTypeAny
>(
    schema: T,
    prompt: string,
    transcript: string,
    maxDepth = 2,
    path: string[] = [],
): Promise<Responses<T>> {
    if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional) {
        return buildResponses(
            schema.unwrap(),
            prompt,
            transcript,
            maxDepth,
            path,
        ) as Promise<Responses<T>>;
    }

    const tooDeep = path.length >= maxDepth;

    if (!(schema instanceof z.ZodObject) || tooDeep) {
        const name = (path.length > 0 ? path.join('_') : 'root').substring(0, 64);
        const wrapper = z.object({
            [name]: schema,
        });

        try {
            const raw = await generateResponse(
                prompt,
                transcript,
                zodTextFormat(wrapper, name),
            );
            return raw?.[name] as Responses<T>;
        } catch (error) {
            console.error(`Error generating response for ${name} at path ${path.join('.')}:`, error);
            return null as unknown as Responses<T>;
        }

    }

    const entries = await Promise.all(
        (Object.entries(schema.shape) as [string, ZodTypeAny][])
            .map(async ([key, child]) => [
                key,
                await buildResponses(child, prompt, transcript, maxDepth, [...path, key]),
            ] as const),
    );

    return Object.fromEntries(entries) as Responses<T>;
}

export async function registerGenerateJob() {
    await boss.createQueue(QUEUE);
    await boss.work<GenerateJob>(QUEUE, async ([job]) => {
        const { noteId, form, transcript } = job.data;
        try {
            const formSchema = FormMapSchema.shape[form];
            if (!formSchema) {
                throw new Error(`Invalid form: ${form}`);
            }
            const prompt = `${PROMPT}\n${FORMS[form].prompt}`;
            const response = await buildResponses(formSchema, prompt, transcript);

            const updatedNote = await prisma.$transaction(async (tx) => {
                const note = await tx.note.findUniqueOrThrow({
                    where: { id: noteId },
                    select: { forms: true },
                });

                const currentForms = (note.forms as any) || {};
                const newForms = {
                    ...currentForms,
                    [form]: response,
                };

                return tx.note.update({
                    where: { id: noteId },
                    data: {
                        forms: newForms,
                    },
                    include: { audios: true },
                });
            });

            emitNoteUpdated(updatedNote);
        } catch (error) {
            console.error(`Failed to process note ${noteId}:`, error);
            emitNoteUpdated(await prisma.note.update({
                where: { id: noteId },
                data: { status: 'ERROR' },
            }));
        }
    });
}