import { Router } from 'express';
import { prisma } from '../prisma';
import { CreatePatientSchema } from '@ai-scribe-oasis/shared/schema';

const r = Router();

r.get('/', async (_, res) => {
    res.json(await prisma.patient.findMany());
});

r.get('/:id', async (req, res) => {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
        where: { id: parseInt(id) },
    });
    if (!patient) {
        res.status(404).json({ error: 'Patient not found' });
        return;
    }
    res.json(patient);
});

r.post('/', async (req, res) => {
    const data = CreatePatientSchema.parse(req.body);
    const patient = await prisma.patient.create({
        data: data as any,
    });
    res.status(201).json(patient);
});

export default r;
