import { Router } from 'express';
import { prisma } from '../prisma';

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

export default r;
