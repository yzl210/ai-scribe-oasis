import {SECTION_G_CODES, SECTION_G_DESCRIPTIONS, SECTION_G_TITLES, SectionGSchema} from './section-g';
import {
    SECTION_GG_CODES,
    SECTION_GG_DESCRIPTIONS,
    SECTION_GG_OPTIONS,
    SECTION_GG_TITLES,
    SectionGGSchema
} from './section-gg';
import {z} from 'zod';

export const OASISSchema = z.object({
    G: SectionGSchema.nullish(),
    GG: SectionGGSchema.nullish(),
});

export type OASIS = z.infer<typeof OASISSchema>;

export const OASIS_PROMPT = `
- SECTION G (Functional Status)
Titles: ${JSON.stringify(SECTION_G_TITLES)}
Descriptions:  ${JSON.stringify(SECTION_G_DESCRIPTIONS)}
Codes/Values:  ${JSON.stringify(SECTION_G_CODES)}
- SECTION GG (Functional Abilities)
Titles:        ${JSON.stringify(SECTION_GG_TITLES)}
Descriptions:  ${JSON.stringify(SECTION_GG_DESCRIPTIONS)}
Options:       ${JSON.stringify(SECTION_GG_OPTIONS)}
Codes/Values:  ${JSON.stringify(SECTION_GG_CODES)}
`;