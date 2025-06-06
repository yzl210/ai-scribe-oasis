import {Router} from 'express';
import multer from 'multer';
import {prisma} from '../prisma';
import {z} from 'zod';
import path from 'node:path';
import {io} from '../index';
import {ALLOWED_AUDIO_MIME_TYPES, MAX_AUDIO_FILE_SIZE} from '@ai-scribe-oasis/shared/constants';
import {SectionGSchema} from '@ai-scribe-oasis/shared/oasis/section-g';
import {SectionGGSchema} from '@ai-scribe-oasis/shared/oasis/section-gg';
import {enqueueTranscription} from '../jobs/transcribe';

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
    await enqueueTranscription(note.id, req.file!.path);
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
    const body = z.object({
        oasisG: SectionGSchema.optional(),
        oasisGG: SectionGGSchema.optional()
    }).parse(req.body);

    const updatedNote = await prisma.note.update({
        where: {id: noteId},
        data: {
            oasisG: body.oasisG,
            oasisGG: body.oasisGG
        }
    });
    emitNoteUpdated(updatedNote);
    res.status(200).json(updatedNote);
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

export default r;

export function emitNoteUpdated(note: any) {
    io.to(String(note.patientId)).emit('noteUpdated', note);
}