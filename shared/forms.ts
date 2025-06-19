import { z } from 'zod';
import { OASIS_PROMPT, OASISSchema } from './oasis/oasis';
import { HOPE_PROMPT, HOPESchema } from './hope/hope';
import { VisitFormSchema } from './visit/visit-form';

export const FormMapSchema = z.object({
    'home-health-oasis-soc': OASISSchema,
    'hospice-hope-soc': HOPESchema,
    'visit-form': VisitFormSchema,
});

export type FormMap = z.infer<typeof FormMapSchema>;
export type Form = keyof FormMap;

export interface FormInfo {
    id: Form;
    name: string;
    shortName: string;
    description: string;
    sections: string[];
    prompt: string;
}

export const FORMS: Record<Form, FormInfo> = {
    'home-health-oasis-soc': {
        id: 'home-health-oasis-soc',
        name: 'Home Health OASIS Start of Care',
        shortName: 'OASIS',
        description: 'OASIS-E assessment for home health start of care',
        sections: ['Section G: Functional Status', 'Section GG: Functional Abilities'],
        prompt: OASIS_PROMPT,
    },
    'hospice-hope-soc': {
        id: 'hospice-hope-soc',
        name: 'Hospice "HOPE" Start of Care',
        shortName: 'HOPE',
        description: 'HOPE assessment for hospice start of care',
        sections: ['Section I: Active Diagnoses', 'Section J: Health Conditions', 'Section M: Skin Conditions', 'Section N: Medications'],
        prompt: HOPE_PROMPT,
    },
    'visit-form': {
        id: 'visit-form',
        name: 'Visit Form',
        shortName: 'Visit Form',
        description: 'Visit form for home health nursing encounters',
        sections: ['Visit Information', 'Symptom Assessment', 'Psychological & Cognitive', 'Interventions', 'Assessment/Impression', 'Plan of Care', 'Patient & Family Education & Response', 'Care Coordination'],
        prompt: '',
    },
} as const;