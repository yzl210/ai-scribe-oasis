import express from 'express';
import 'dotenv/config';
import patientRoutes from './routes/patients';
import noteRoutes from './routes/notes';
import cors from 'cors';
import * as http from 'node:http';
import { Server } from 'socket.io';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/patients', patientRoutes);
app.use('/notes', noteRoutes);


const server = http.createServer(app);
export const io = new Server(server, {
    path: '/ws',
    cors: { origin: process.env.CLIENT_ORIGIN },
});

io.on('connection', socket => {
    socket.on('joinPatientRoom', pid => socket.join(pid));
    socket.on('leavePatientRoom', pid => socket.leave(pid));
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`API listening on port ${port}`));
