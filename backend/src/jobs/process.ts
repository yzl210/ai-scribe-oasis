import boss from './boss';
import {generateResponse, transcribeAudio} from '../openai';
import {prisma} from '../prisma';
import {emitNoteUpdated} from '../routes/notes';
import {z} from 'zod';
import {zodTextFormat} from 'openai/helpers/zod';
import {NoteStatus} from '@prisma/client';

const QUEUE = 'process';

const PROMPT = 'Generate a title and summary for a home health nursing note based on the transcript. The title should be concise and descriptive, while the summary should be in 2-4 clinical sentences and provide a brief overview of the patient encounter.';

type ProcessJob = {
    noteId: number;
    audioPath: string;
}

const ResponseSchema = z.object({
    title: z.string().max(100),
    summary: z.string(),
});

export async function enqueueProcess(noteId: number, audioPath: string) {
    await boss.send(QUEUE, {noteId, audioPath} as ProcessJob);
}

async function updateNote(noteId: number, status: NoteStatus, data?: Object) {
    const updatedNote = await prisma.note.update({
        where: {id: noteId},
        data: {status, ...data},
    });
    emitNoteUpdated(updatedNote);
    return updatedNote;
}

async function processAudio(noteId: number, audioPath: string): Promise<void> {
    const transcript = await transcribeAudio(audioPath);
    await updateNote(noteId, 'PROCESSING', {transcript});

    const response = await generateResponse(
        PROMPT,
        transcript,
        zodTextFormat(ResponseSchema, 'response')
    );

    if (!response) {
        throw new Error('Failed to generate response');
    }

    await updateNote(noteId, 'READY', {
        title: response.title,
        summary: response.summary
    });
}

export async function registerProcessJob() {
    await boss.createQueue(QUEUE);
    await boss.work<ProcessJob>(QUEUE, async ([job]) => {
        const {noteId, audioPath} = job.data;
        try {
            await updateNote(noteId, 'PROCESSING');
            await processAudio(noteId, audioPath);
        } catch (error) {
            console.error(`Failed to process note ${noteId}:`, error);
            await updateNote(noteId, 'ERROR');
        }
    });
}