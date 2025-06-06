import {SectionGG} from './oasis/section-gg';
import {SectionG} from './oasis/section-g';

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
    audioUrl: string;
    transcript: string;
    summary: string;
    oasisG: SectionG;
    oasisGG: SectionGG;
    createdAt: string;
    updatedAt: string;
    status: 'PENDING' | 'TRANSCRIBING' | 'TRANSCRIBED' | 'PROCESSING' | 'PROCESSED' | 'ERROR';
}

