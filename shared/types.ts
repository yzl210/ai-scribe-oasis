import { FormMap } from './forms';

export interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    dob: string;
    phone?: string;
    address?: string;
    mrn: string;
}

export interface Audio {
    id: number;
    noteId: number;
    path: string;
    transcript?: string;
    mimetype?: string;
    createdAt: string;
}

export interface Note {
    id: number;
    patientId: number;
    title?: string;
    audios: Audio[];
    summary?: string;
    forms: Partial<FormMap>;
    createdAt: string;
    status: 'PENDING' | 'PROCESSING' | 'READY' | 'ERROR';
}

