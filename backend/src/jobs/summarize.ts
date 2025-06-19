import boss from './boss';
import { generateResponse } from '../openai';
import { prisma } from '../prisma';
import { emitNoteUpdated } from '../routes/notes';
import { z } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod';
import { NoteStatus } from '@prisma/client';

const QUEUE = 'process';

const PROMPT = 'Generate a title and summary for a home health nursing note based on the transcript. The title should be concise and descriptive, while the summary should be in 2-4 clinical sentences and provide a brief overview of the patient encounter. Do not come up with any new information that is not in the transcript.';

type SummarizeJob = {
    noteId: number;
}

const ResponseSchema = z.object({
    title: z.string().max(100),
    summary: z.string(),
});

export async function enqueueSummarize(noteId: number) {
    await boss.send(QUEUE, { noteId } as SummarizeJob);
}

async function updateNote(noteId: number, status: NoteStatus, data?: Object) {
    const updatedNote = await prisma.note.update({
        where: { id: noteId },
        data: { status, ...data },
        include: { audios: true },
    });
    emitNoteUpdated(updatedNote);
    return updatedNote;
}

async function summarizeNote(noteId: number) {
    await updateNote(noteId, 'PROCESSING');
    const note = await prisma.note.findUnique({
        where: { id: noteId },
        include: { audios: { select: { transcript: true } } },
    });

    if (!note) {
        throw new Error('Note not found');
    }

    const transcripts = note.audios.map(audio => audio.transcript).filter(Boolean);
    if (transcripts.length === 0) {
        throw new Error('No transcripts available');
    }

    const combinedTranscript = transcripts.join('\n\n');
    const response = await generateResponse(
        PROMPT,
        combinedTranscript,
        zodTextFormat(ResponseSchema, 'response'),
    );

    if (!response) {
        throw new Error('Failed to generate response');
    }

    await updateNote(noteId, 'READY', {
        title: response.title,
        summary: response.summary,
    });
}

export async function registerSummarizeJob() {
    await boss.createQueue(QUEUE);
    await boss.work<SummarizeJob>(QUEUE, async ([job]) => {
        const { noteId } = job.data;
        try {
            await summarizeNote(noteId);
        } catch (error) {
            console.error(`Failed to summarize note ${noteId}:`, error);
            await updateNote(noteId, 'ERROR');
        }
    });
}