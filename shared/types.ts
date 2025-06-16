import {FormMap} from './forms';

export interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    dob: string;
    phone?: string;
    address?: string;
    mrn: string;
}

export interface Note {
    id: number;
    patientId: number;
    title?: string;
    audioUrl: string;
    transcript: string;
    summary: string;
    forms: Partial<FormMap>;
    createdAt: string;
    updatedAt: string;
    status: 'PENDING' | 'PROCESSING' | 'READY' | 'ERROR';
}

