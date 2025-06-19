import { keysToSchema, zodEnumFromObject } from '../utils';
import { z } from 'zod';

export const M1190 = {
    '0': 'No - Skip to N0500, Scheduled Opioid',
    '1': 'Yes',
} as const
export const M1190Schema = zodEnumFromObject(M1190);

export const M1195 = {
    A: 'Diabetic foot ulcer(s)',
    B: 'Open lesion(s) other than ulcers, rash, or skin tear (cancer lesions)',
    C: 'Pressure ulcer(s)/injuries',
    D: 'Rash(es)',
    E: 'Skin tear(s)',
    F: 'Surgical wound(s)',
    G: 'Ulcers other than diabetic or pressure ulcers (e.g., venous stasis ulcer, Kennedy ulcer)',
    H: 'Moisture Associated Skin Damage (MASD) (e.g., incontinence-associated dermatitis [IAD], perspiration, drainage)',
    Z: 'None of the above were present',
} as const
export const M1195Schema = z.object(
    keysToSchema(Object.keys(M1195), z.boolean().nullable()),
)

export const M1200 = {
    A: 'Pressure reducing device for chair',
    B: 'Pressure reducing device for bed',
    C: 'Turning/repositioning program',
    D: 'Nutrition or hydration intervention to manage skin problems',
    E: 'Pressure ulcer/injury care',
    F: 'Surgical wound care',
    G: 'Application of nonsurgical dressings (with or without topical medications) other than to feet',
    H: 'Application of ointments/medications other than to feet',
    I: 'Application of dressings to feet (with or without topical medications)',
    J: 'Incontinence Management',
    Z: 'None of the above were provided',
} as const
export const M1200Schema = z.object(
    keysToSchema(Object.keys(M1200), z.boolean().nullable()),
)

export const SectionMSchema = z.object({
    M1190: M1190Schema.nullable(),
    M1195: M1195Schema.nullable(),
    M1200: M1200Schema.nullable(),
})
export type SectionM = z.infer<typeof SectionMSchema>;

export const SECTION_M_TITLES = {
    M1190: 'Skin Conditions',
    M1195: 'Types of Skin Conditions',
    M1200: 'Skin and Ulcer/Injury Treatments',
} as const

export const SECTION_M_DESCRIPTIONS = {
    M1190: 'Does the patient have one or more skin conditions?',
    M1195: 'Indicate which following skin conditions were identified at the time of this assessment.',
    M1200: 'Indicate the interventions or treatments in place at the time of this assessment.',
} as const

export const SECTION_M_CODES = {
    M1190,
    M1195,
    M1200,
} as const