import { z } from 'zod';
import { keysToSchema, zodEnumFromObject } from '../utils';

export const I0010 = {
    '01': 'Cancer',
    '02': 'Dementia (including Alzheimer’s disease)',
    '03': 'Neurological Condition (e.g., Parkinson’s disease, multiple sclerosis, ALS)',
    '04': 'Stroke',
    '05': 'Chronic Obstructive Pulmonary Disease (COPD)',
    '06': 'Cardiovascular (excluding heart failure)',
    '07': 'Heart Failure',
    '08': 'Liver Disease',
    '09': 'Renal Disease',
    '99': 'None of the above',
} as const
export const I0010Schema = zodEnumFromObject(I0010);


export const SectionISchema = z.object({
    I0010: I0010Schema.nullable(),
    ...keysToSchema(['I0100', 'I0600', 'I0900', 'I0950', 'I1101', 'I1510', 'I2102', 'I2900', 'I2910', 'I4501', 'I4801', 'I5150', 'I5401', 'I6202', 'I8005'], z.boolean().nullable()),
})

export type SectionI = z.infer<typeof SectionISchema>;

export const SECTION_I_TITLES = {
    I0010: 'Principal Diagnosis',
    I0100: 'Cancer',
    I0600: 'Heart Failure (e.g., congestive heart failure (CHF) and pulmonary edema)',
    I0900: 'Peripheral Vascular Disease (PVD) or Peripheral Arterial Disease (PAD)',
    I0950: 'Cardiovascular (excluding heart failure)',
    I1101: 'Liver disease (e.g., cirrhosis)',
    I1510: 'Renal disease',
    I2102: 'Sepsis',
    I2900: 'Diabetes Mellitus (DM)',
    I2910: 'Neuropathy',
    I4501: 'Stroke',
    I4801: 'Dementia (including Alzheimer’s disease)',
    I5150: 'Neurological Conditions (e.g., Parkinson’s disease, multiple sclerosis, ALS)',
    I5401: 'Seizure Disorder',
    I6202: 'Chronic Obstructive Pulmonary Disease (COPD)',
    I8005: 'Other Medical Condition',
} as const

export const SECTION_I_CATEGORIES = {
    'Cancer': ['I0100'],
    'Heart/Circulation': ['I0600', 'I0900', 'I0950'],
    'Gastrointestinal': ['I1101'],
    'Genitourinary': ['I1510'],
    'Infections': ['I2102'],
    'Metabolic': ['I2900', 'I2910'],
    'Neurological': ['I4501', 'I4801', 'I5150', 'I5401'],
    'Pulmonary': ['I6202'],
    'Other': ['I8005'],
} as const

export const SECTION_I_CODES = {
    I0010,
} as const