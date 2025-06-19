import boss from './boss';
import { transcribeAudio } from '../openai';
import { prisma } from '../prisma';
import { emitNoteUpdated } from '../routes/notes';
import { NoteStatus } from '@prisma/client';
import { enqueueSummarize } from './summarize';

const QUEUE = 'transcribe';

type TranscribeJob = {
    audioId: number;
}

export async function enqueueProcess(audioId: number) {
    await boss.send(QUEUE, { audioId } as TranscribeJob);
}

async function updateNote(noteId: number, status: NoteStatus) {
    const updatedNote = await prisma.note.update({
        where: { id: noteId },
        data: { status },
        include: { audios: true },
    });
    emitNoteUpdated(updatedNote);
    return updatedNote;
}

async function processAudio(audioId: number) {
    const audio = await prisma.audio.findUnique({
        where: { id: audioId },
        include: { note: true },
    });

    if (!audio) {
        throw new Error('Audio record not found');
    }

    await updateNote(audio.noteId, 'PROCESSING');

    const transcript = await transcribeAudio(audio.path);

    await prisma.audio.update({
        where: { id: audioId },
        data: { transcript },
    });

    await updateNote(audio.noteId, 'PENDING');

    await enqueueSummarize(audio.noteId);
}

export async function registerTranscribeJob() {
    await boss.createQueue(QUEUE);
    await boss.work<TranscribeJob>(QUEUE, async ([job]) => {
        const { audioId } = job.data;
        try {
            await processAudio(audioId);
        } catch (error) {
            console.error(`Failed to process audio ${audioId}:`, error);
            const audio = await prisma.audio.findUnique({ where: { id: audioId } });
            if (audio) {
                await updateNote(audio.noteId, 'ERROR');
            }
        }
    });
}