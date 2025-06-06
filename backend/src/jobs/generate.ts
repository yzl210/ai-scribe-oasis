import {
    SECTION_G_CODES,
    SECTION_G_DESCRIPTIONS,
    SECTION_G_TITLES,
    SectionGSchema
} from '@ai-scribe-oasis/shared/oasis/section-g';
import {
    SECTION_GG_CODES,
    SECTION_GG_DESCRIPTIONS,
    SECTION_GG_OPTIONS,
    SECTION_GG_TITLES,
    SectionGGSchema
} from '@ai-scribe-oasis/shared/oasis/section-gg';
import {z} from 'zod';
import boss from './boss';
import {prisma} from '../prisma';
import {generateResponse} from '../openai';
import {zodTextFormat} from 'openai/helpers/zod';
import {emitNoteUpdated} from '../routes/notes';

const queue = 'generate';

const prompt = `
You are a clinical documentation assistant helping home health nurses complete OASIS-E assessments based on encounter transcripts.

- TASKS  
1. Summary – In 2-4 clinical sentences, summarize the patient’s functional abilities discussed in the transcript.  
2. Form Filling – Using only evidence from the transcript, choose the correct code for every item in Section G and Section GG. If a field is not addressed, leave it as null.

- SECTION G (Functional Status)
Titles:        ${JSON.stringify(SECTION_G_TITLES)}
Descriptions:  ${JSON.stringify(SECTION_G_DESCRIPTIONS)}
Codes/Values:  ${JSON.stringify(SECTION_G_CODES)}
- SECTION GG (Functional Abilities)
Titles:        ${JSON.stringify(SECTION_GG_TITLES)}
Descriptions:  ${JSON.stringify(SECTION_GG_DESCRIPTIONS)}
Options:       ${JSON.stringify(SECTION_GG_OPTIONS)}
Codes/Values:  ${JSON.stringify(SECTION_GG_CODES)}
`;

type GenerateJob = {
    noteId: number;
    transcript: string;
}

export const ResponseSchema = z.object({
    summary: z.string(),
    G: SectionGSchema,
    GG: SectionGGSchema
});

export async function enqueueGeneration(noteId: number, transcript: string) {
    await boss.send(queue, {noteId, transcript} as GenerateJob);
}

export async function registerGenerateJob() {
    await boss.createQueue(queue);
    await boss.work<GenerateJob>(queue, async ([job]) => {
        const {noteId, transcript} = job.data;
        emitNoteUpdated(await prisma.note.update({
            where: {id: noteId},
            data: {status: 'PROCESSING'},
        }));
        try {
            const response = await generateResponse(prompt, transcript, zodTextFormat(ResponseSchema, 'response'));
            emitNoteUpdated(await prisma.note.update({
                where: {id: noteId},
                data: {
                    transcript,
                    summary: response?.summary,
                    oasisG: response?.G,
                    oasisGG: response?.GG,
                    status: 'PROCESSED'
                },
            }));
        } catch (error) {
            console.error(`Failed to process note ${noteId}:`, error);
            emitNoteUpdated(await prisma.note.update({
                where: {id: noteId},
                data: {status: 'ERROR'},
            }));
        }
    });
}