import {z} from 'zod';
import {SECTION_I_CODES, SECTION_I_TITLES, SectionISchema} from './section-i';
import {SECTION_J_CODES, SECTION_J_DESCRIPTIONS, SECTION_J_TITLES, SectionJSchema} from './section-j';
import {SECTION_M_DESCRIPTIONS, SECTION_M_TITLES, SectionMSchema} from './section-m';
import {SECTION_N_CODES, SECTION_N_DESCRIPTIONS, SECTION_N_TITLES, SectionNSchema} from './section-n';

export const HOPESchema = z.object({
    I: SectionISchema.nullish(),
    J: SectionJSchema.nullish(),
    M: SectionMSchema.nullish(),
    N: SectionNSchema.nullish(),
});

export type HOPE = z.infer<typeof HOPESchema>;

export const HOPE_PROMPT = `
- SECTION I (Active Diagnoses)
Titles: ${JSON.stringify(SECTION_I_TITLES)}
Codes/Values:  ${JSON.stringify(SECTION_I_CODES)}
- SECTION J (Health Conditions)
Titles:        ${JSON.stringify(SECTION_J_TITLES)}
Descriptions:  ${JSON.stringify(SECTION_J_DESCRIPTIONS)}
Codes/Values:  ${JSON.stringify(SECTION_J_CODES)}
- SECTION M (Skin Conditions)
Titles:        ${JSON.stringify(SECTION_M_TITLES)}
Descriptions:  ${JSON.stringify(SECTION_M_DESCRIPTIONS)}
Codes/Values:  ${JSON.stringify(SECTION_M_DESCRIPTIONS)}
- SECTION N (Medications)
Titles:        ${JSON.stringify(SECTION_N_TITLES)}
Descriptions:  ${JSON.stringify(SECTION_N_DESCRIPTIONS)}
Codes/Values:  ${JSON.stringify(SECTION_N_CODES)}
`;