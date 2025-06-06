import boss from './boss';
import {transcribeAudio} from '../openai';
import {prisma} from '../prisma';
import {enqueueGeneration} from './generate';
import {emitNoteUpdated} from '../routes/notes';

const queue = 'transcribe';

type TranscribeJob = {
    noteId: number;
    audioPath: string;
}

export async function enqueueTranscription(noteId: number, audioPath: string) {
    await boss.send(queue, {noteId, audioPath} as TranscribeJob);
}

export async function registerTranscribeJob() {
    await boss.createQueue(queue);
    await boss.work<TranscribeJob>(queue, async ([job]) => {
        const {noteId, audioPath} = job.data;
        emitNoteUpdated(await prisma.note.update({
            where: {id: noteId},
            data: {status: 'TRANSCRIBING'},
        }));
        try {
            const transcript = await transcribeAudio(audioPath);
            emitNoteUpdated(await prisma.note.update({
                where: {id: noteId},
                data: {transcript, status: 'TRANSCRIBED'},
            }));
            await enqueueGeneration(noteId, transcript);
        } catch (error) {
            console.error(`Failed to transcribe audio for note ${noteId}:`, error);
            emitNoteUpdated(await prisma.note.update({
                where: {id: noteId},
                data: {status: 'ERROR'},
            }));
        }
    });
}