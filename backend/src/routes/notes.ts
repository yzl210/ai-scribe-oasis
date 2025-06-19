import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../prisma';
import { z } from 'zod';
import path from 'node:path';
import { io } from '../index';
import { ALLOWED_AUDIO_MIME_TYPES, MAX_AUDIO_FILE_SIZE } from '@ai-scribe-oasis/shared/constants';
import { FormMapSchema } from '@ai-scribe-oasis/shared/forms';
import { enqueueProcess } from '../jobs/transcribe';
import { enqueueGeneration } from '../jobs/generate';
import { merge, pickBy } from 'lodash';
import { Prisma } from '@prisma/client';

const destination = process.env.AUDIO_STORAGE_PATH || './uploads/';

const storage = multer.diskStorage({
    destination,
    filename: (_req, file, cb) =>
        cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_AUDIO_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_AUDIO_MIME_TYPES.includes(file.mimetype as any)) {
            cb(null, true);
        } else {
            cb(
                new multer.MulterError(
                    'LIMIT_UNEXPECTED_FILE',
                    'Only MP3, WAV, or M4A files are allowed',
                ),
            );
        }
    },
});

const r = Router();

r.post('/audio', upload.single('audio'), async (req, res) => {
    const body = z.object({ patientId: z.coerce.number() }).parse(req.body);
    const note = await prisma.note.create({
        data: {
            patientId: body.patientId,
            audios: {
                create: {
                    path: req.file!.path,
                    mimetype: req.file!.mimetype,
                },
            },
        },
        include: { audios: true },
    });
    await enqueueProcess(note.audios[0].id);
    io.to(String(note.patientId)).emit('noteCreated', note);
    res.status(202).json(note);
});

r.post('/:id/audio', upload.single('audio'), async (req, res) => {
    const noteId = z.coerce.number().parse(req.params.id);

    const note = await prisma.note.findUnique({
        where: { id: noteId },
        select: { status: true },
    });

    if (!note) {
        res.status(404).json({ error: 'Note not found' });
        return;
    }

    if (note.status !== 'READY') {
        res.status(400).json({ error: 'Note not ready for audio upload' });
        return;
    }

    const audio = await prisma.audio.create({
        data: {
            noteId,
            path: req.file!.path,
            mimetype: req.file!.mimetype,
        },
    });

    const updatedNote = await prisma.note.findUniqueOrThrow({
        where: { id: noteId },
        include: { audios: true },
    });

    await enqueueProcess(audio.id);
    emitNoteUpdated(updatedNote);
    res.status(202).json(audio);
});

r.get('/', async (_req, res) => {
    const notes = await prisma.note.findMany({
        include: { audios: true },
    });
    res.json(notes);
});

r.get('/patient/:id', async (req, res) => {
    const patientId = z.coerce.number().parse(req.params.id);
    const notes = await prisma.note.findMany({
        where: { patientId },
        include: { audios: true },
    });
    res.json(notes);
});


r.patch('/:id', async (req, res) => {
    const noteId = z.coerce.number().parse(req.params.id);
    const body = FormMapSchema.partial().parse(req.body);

    const updatedNote = await prisma.$transaction(async (tx) => {
        const note = await tx.note.findUnique({
            where: { id: noteId },
            select: { forms: true },
        });


        const existingForms = (note?.forms) || {};
        const mergedForms = merge(existingForms, pickBy(body, v => v !== undefined));

        return tx.note.update({
            where: { id: noteId },
            data: {
                forms: mergedForms,
            },
            include: { audios: true },
        });
    });

    emitNoteUpdated(updatedNote);
    res.json(updatedNote);
});

r.get('/audio/:audioId', async (req, res) => {
    const audioId = z.coerce.number().parse(req.params.audioId);
    const audio = await prisma.audio.findUnique({
        where: { id: audioId },
    });
    if (!audio) {
        res.status(404).json({ error: 'Audio not found' });
        return;
    }
    res.sendFile(audio.path, { root: '.' });
});

r.post('/:id/form', async (req, res) => {
    const noteId = z.coerce.number().parse(req.params.id);
    const body = z.object({
        form: FormMapSchema.keyof(),
    }).parse(req.body);

    const note = await prisma.note.findUnique({
        where: { id: noteId },
        select: { status: true, forms: true, audios: { select: { transcript: true } } },
    });
    if (!note) {
        res.status(404).json({ error: 'Note not found' });
        return;
    }

    if (note.status !== 'READY') {
        res.status(400).json({ error: 'Note not ready for form generation' });
        return;
    }

    const transcripts = note.audios.filter(a => a.transcript).map(a => a.transcript);
    if (transcripts.length === 0) {
        res.status(400).json({ error: 'No transcripts available for this note' });
        return;
    }

    const forms = note.forms as Prisma.JsonObject;

    const updatedNote = await prisma.note.update({
        where: { id: noteId },
        data: {
            forms: merge(forms || {}, {
                [body.form]: null,
            }),
        },
        include: { audios: true },
    });
    emitNoteUpdated(updatedNote);

    const combinedTranscript = transcripts.join('\n\n');
    await enqueueGeneration(noteId, body.form, combinedTranscript);
    res.status(202).json({ message: 'Success' });
});

export default r;

export function emitNoteUpdated(note: any) {
    io.to(String(note.patientId)).emit('noteUpdated', note);
}