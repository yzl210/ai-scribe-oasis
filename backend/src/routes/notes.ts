import {Router} from 'express';
import multer from 'multer';
import {prisma} from '../prisma';
import {z} from 'zod';
import path from 'node:path';
import {io} from '../index';
import {ALLOWED_AUDIO_MIME_TYPES, MAX_AUDIO_FILE_SIZE} from '@ai-scribe-oasis/shared/constants';
import {FormMapSchema} from '@ai-scribe-oasis/shared/forms';
import {enqueueProcess} from '../jobs/process';
import {enqueueGeneration} from '../jobs/generate';
import {merge, pickBy} from 'lodash';
import {Prisma} from '@prisma/client';

const destination = process.env.AUDIO_STORAGE_PATH || './uploads/';

const storage = multer.diskStorage({
    destination,
    filename: (_req, file, cb) =>
        cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
    storage,
    limits: {fileSize: MAX_AUDIO_FILE_SIZE},
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_AUDIO_MIME_TYPES.includes(file.mimetype as any)) {
            cb(null, true);
        } else {
            cb(
                new multer.MulterError(
                    'LIMIT_UNEXPECTED_FILE',
                    'Only MP3, WAV, or M4A files are allowed'
                )
            );
        }
    },
});

const r = Router();

r.post('/', upload.single('audio'), async (req, res) => {
    const body = z.object({patientId: z.coerce.number()}).parse(req.body);
    const note = await prisma.note.create({
        data: {patientId: body.patientId, audioUrl: req.file!.path}
    });
    await enqueueProcess(note.id, req.file!.path);
    io.to(String(note.patientId)).emit('noteCreated', note);
    res.status(202).json(note);
});

r.get('/', async (_req, res) => {
    const notes = await prisma.note.findMany();
    res.json(notes);
});

r.get('/patient/:id', async (req, res) => {
    const patientId = z.coerce.number().parse(req.params.id);
    const notes = await prisma.note.findMany({
        where: {patientId}
    });
    res.json(notes);
});


r.patch('/:id', async (req, res) => {
    const noteId = z.coerce.number().parse(req.params.id);
    const body = FormMapSchema.partial().parse(req.body);

    const updatedNote = await prisma.$transaction(async (tx) => {
        const note = await tx.note.findUnique({
            where: {id: noteId},
            select: {forms: true}
        });


        const existingForms = (note?.forms) || {};
        const mergedForms = merge(existingForms, pickBy(body, v => v !== undefined));

        return tx.note.update({
            where: {id: noteId},
            data: {
                forms: mergedForms,
            }
        });
    });

    emitNoteUpdated(updatedNote);
    res.json(updatedNote);

});

r.get('/audio/:id', async (req, res) => {
    const noteId = z.coerce.number().parse(req.params.id);
    const note = await prisma.note.findUnique({
        where: {id: noteId},
        select: {audioUrl: true}
    });
    if (!note || !note.audioUrl) {
        res.status(404).json({error: 'Audio not found'});
        return;
    }
    res.sendFile(note.audioUrl, {root: '.'});
});

r.post('/:id/form', async (req, res) => {
    const noteId = z.coerce.number().parse(req.params.id);
    const body = z.object({
        form: FormMapSchema.keyof(),
    }).parse(req.body);

    const note = await prisma.note.findUnique({
        where: {id: noteId},
        select: {transcript: true, forms: true}
    });
    if (!note || !note.transcript) {
        res.status(404).json({error: 'Note not found or transcript missing'});
        return;
    }

    const forms = note.forms as Prisma.JsonObject;

    if (forms && forms[body.form]) {
        res.status(400).json({error: `Form ${body.form} already exists for this note`});
        return;
    }
    const updatedNote = await prisma.note.update({
        where: {id: noteId},
        data: {
            forms: merge(forms || {}, {
                [body.form]: null
            })
        }
    });
    emitNoteUpdated(updatedNote);
    await enqueueGeneration(noteId, body.form, note.transcript);
    res.status(202).json({message: 'Success'});
});

export default r;

export function emitNoteUpdated(note: any) {
    io.to(String(note.patientId)).emit('noteUpdated', note);
}