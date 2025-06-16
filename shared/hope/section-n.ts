import {z} from 'zod';
import {zodEnumFromObject} from '../utils';


export const N0500A = {
    '0': 'No — Skip to N0510, PRN Opioid',
    '1': 'Yes',
};
export const N0500Schema = z.object({
    A: zodEnumFromObject(N0500A).nullable(),
    B: z.coerce.date().nullable(),
});

export const N0510A = {
    '0': 'No — Skip to N0520, Bowel Regimen',
    '1': 'Yes',
};
export const N0510Schema = z.object({
    A: zodEnumFromObject(N0510A).nullable(),
    B: z.coerce.date().nullable(),
});

export const N0520A = {
    '0': 'No — Skip to Z0400. Signature(s) of Person(s) Completing the Record',
    '1': 'No, but there is documentation of why a bowel regimen was not initiated or continued — Skip to Z0400. Signature(s) of Person(s) Completing the Record',
    '2': 'Yes',
} as const;
export const N0520Schema = z.object({
    A: zodEnumFromObject(N0520A).nullable(),
    B: z.coerce.date().nullable(),
});

export const SectionNSchema = z.object({
    N0500: N0500Schema.nullable(),
    N0510: N0510Schema.nullable(),
    N0520: N0520Schema.nullable(),
});
export type SectionN = z.infer<typeof SectionNSchema>;

export const SECTION_N_TITLES = {
    N0500: 'Scheduled Opioid',
    N0510: 'PRN Opioid',
    N0520: 'Bowel Regimen (Complete only if N0500A or N0510A=1)',
} as const;

export const SECTION_N_DESCRIPTIONS = {
    N0500: {
        A: 'Was a scheduled opioid initiated or continued?',
        B: 'Date scheduled opioid initiated or continued:',
    },
    N0510: {
        A: 'Was PRN opioid initiated or continued?',
        B: 'Date PRN opioid initiated or continued:',
    },
    N0520: {
        A: 'Was a bowel regimen initiated or continued? - Select the most accurate response',
        B: 'Date bowel regimen initiated or continued:',
    }
} as const;

export const SECTION_N_CODES = {
    N0500A,
    N0510A,
    N0520A,
} as const;