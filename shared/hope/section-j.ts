import {z} from 'zod';
import {keysToSchema, zodEnumFromObject} from '../utils';

export const J0050 = {
    '0': 'No',
    '1': 'Yes',
};
export const J0050Schema = zodEnumFromObject(J0050);

export const J0900A = {
    '0': 'No — Skip to J0905, Pain Active Problem',
    '1': 'Yes',
};
export const J0900C = {
    '0': 'None',
    '1': 'Mild',
    '2': 'Moderate',
    '3': 'Severe',
    '9': 'Pain not rated',
} as const;
export const J0900D = {
    '1': 'Numeric',
    '2': 'Verbal descriptor',
    '3': 'Patient visual',
    '4': 'Staff observation',
    '9': 'No standardized tool used',
} as const;
export const J0900Schema = z.object({
    A: zodEnumFromObject(J0900A).nullable(),
    B: z.coerce.date().nullable(),
    C: zodEnumFromObject(J0900C).nullable(),
    D: zodEnumFromObject(J0900D).nullable(),
});

export const J0905 = {
    '0': 'No — Skip to J2030, Screening for Shortness of Breath',
    '1': 'Yes',
};
export const J0905Schema = zodEnumFromObject(J0905);


export const J0910A = {
    '0': 'No — Skip to J2030, Screening for Shortness of Breath',
    '1': 'Yes',
};
export const J0910C = {
    '1': 'Location',
    '2': 'Severity',
    '3': 'Character',
    '4': 'Duration',
    '5': 'Frequency',
    '6': 'What relieves/worsens pain',
    '7': 'Effect on function or quality of life',
    '9': 'None of the above',
} as const;
export const J0910Schema = z.object({
    A: zodEnumFromObject(J0910A).nullable(),
    B: z.coerce.date().nullable(),
    C: z.object(keysToSchema(Object.keys(J0910C), z.boolean().nullable())),
});

export const J0915 = {
    '0': 'No',
    '1': 'Yes',
} as const;
export const J0915Schema = zodEnumFromObject(J0915);

export const J2030A = {
    '0': 'No — Skip to J2050, Symptom Impact Screening',
    '1': 'Yes',
} as const;
export const J2030C = {
    '0': 'No — Skip to J2050, Symptom Impact Screening',
    '1': 'Yes',
} as const;
export const J2030Schema = z.object({
    A: zodEnumFromObject(J2030A).nullable(),
    B: z.coerce.date().nullable(),
    C: zodEnumFromObject(J2030C).nullable(),
});

export const J2040A = {
    '0': 'No — Skip to J2050, Symptom Impact Screening',
    '1': 'No, patient declined treatment — Skip to J2050, Symptom Impact Screening',
    '2': 'Yes',
} as const;
export const J2040Schema = z.object({
    A: zodEnumFromObject(J2040A).nullable(),
    B: z.coerce.date().nullable(),
});

export const J2050A = {
    '0': 'No — Skip to M1190, Skin Conditions',
    '1': 'Yes',
} as const;
export const J2050Schema = z.object({
    A: zodEnumFromObject(J2050A).nullable(),
    B: z.string().nullable(),
});


export const SYMPTOM_IMPACTS = {
    '0': 'Not at all – symptom does not affect the patient, including symptoms well-controlled with current treatment',
    '1': 'Slight',
    '2': 'Moderate',
    '3': 'Severe',
    '9': 'Not applicable (the patient is not experiencing the symptom)',
} as const;
export const SymptomImpactSchema = zodEnumFromObject(SYMPTOM_IMPACTS);

export const J2051Schema = z.object(
    keysToSchema(
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        SymptomImpactSchema.nullable()
    )
);

export const J2052A = {
    '0': 'No — Skip to J2052C. Reason SFV Not Completed.',
    '1': 'Yes',
} as const;
export const J2052C = {
    '1': 'Patient and/or caregiver declined an in‑person visit.',
    '2': 'Patient unavailable (e.g., in ED, hospital, travel outside of service area, expired).',
    '3': 'Attempts to contact patient and/or caregiver were unsuccessful.',
    '9': 'None of the above',
} as const;
export const J2052Schema = z.object({
    A: zodEnumFromObject(J2052A).nullable(),
    B: z.coerce.date().nullable(),
    C: zodEnumFromObject(J2052C).nullable(),
});

export const J2053Schema = z.object(
    keysToSchema(
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const,
        SymptomImpactSchema.nullable()
    )
);

export const SectionJSchema = z.object({
    J0050: J0050Schema.nullable(),
    J0900: J0900Schema.nullable(),
    J0905: J0905Schema.nullable(),
    J0910: J0910Schema.nullable(),
    J0915: J0915Schema.nullable(),
    J2030: J2030Schema.nullable(),
    J2040: J2040Schema.nullable(),
    J2050: J2050Schema.nullable(),
    J2051: J2051Schema.nullable(),
    J2052: J2052Schema.nullable(),
    J2053: J2053Schema.nullable(),
});
export type SectionJ = z.infer<typeof SectionJSchema>;

export const SECTION_J_TITLES = {
    J0050: 'Death is Imminent',
    J0900: 'Pain Screening',
    J0905: 'Pain Active Problem',
    J0910: 'Comprehensive Pain Assessment',
    J0915: 'Neuropathic Pain',
    J2030: 'Screening for Shortness of Breath',
    J2040: 'Treatment for Shortness of Breath',
    J2050: 'Symptom Impact Screening',
    J2051: 'Symptom Impact',
    J2052: 'Symptom Follow-up Visit (SFV) (complete only if any response to J2051 Symptom Impact = 2. Moderate or 3. Severe)',
    J2053: 'SFV Symptom Impact'
} as const;

export const SECTION_J_DESCRIPTIONS = {
    J0050: 'At the time of this assessment and based on your clinical assessment, does the patient appear to have a life expectancy of 3 days or less?',
    J0900: {
        A: 'Was the patient screened for pain?',
        B: 'Date of first screening for pain',
        C: 'The patient’s pain severity was:',
        D: 'Type of standardized pain tool used:',
    },
    J0905: 'Is pain an active problem for the patient?',
    J0910: {
        A: 'Was a comprehensive pain assessment done?',
        B: 'Date of Comprehensive pain assessment',
        C: 'Comprehensive pain assessment included:',
    },
    J0915: 'Does the patient have neuropathic pain (e.g., pain with burning, tingling, pins and needles, hypersensitivity to touch)?',
    J2030: {
        A: 'Was the patient screened for shortness of breath?',
        B: 'Date of first screening for shortness of breath:',
        C: 'Did the screening indicate the patient had shortness of breath?',
    },
    J2040: {
        A: 'Was treatment for shortness of breath initiated?',
        B: 'Date treatment for shortness of breath initiated:',
    },
    J2050: {
        A: 'Was a symptom impact screening completed?',
        B: 'Date of symptom impact screening:',
    },
    J2051: {
        _: 'Over the past 2 days, how has the patient been affected by each of the following symptoms? Base this on your clinical assessment (including input from patient and/or caregiver). Symptoms may impact multiple patient activities including, but not limited to, sleep, concentration, day to day activities, or ability to interact with others.',
        A: 'Pain',
        B: 'Shortness of breath',
        C: 'Anxiety',
        D: 'Nausea',
        E: 'Vomiting',
        F: 'Diarrhea',
        G: 'Constipation',
        H: 'Agitation',
    },
    J2052: {
        _: 'An in-person Symptom Follow-up Visit (SFV) should occur within 2 calendar days as a follow-up for any moderate or severe pain or non-pain symptom identified during Symptom Impact assessment at Admission or HOPE Update Visit (HUV).',
        A: 'Was a follow-up visit for symptoms completed?',
        B: 'Date of follow-up visit for symptoms:',
        C: 'Reason SFV not completed:',
    },
    J2053: {
        _: 'Since the last Symptom Impact assessment was completed, how has the patient been affected by each of the following symptoms? Base this on your clinical assessment (including input from patient and/or caregiver). Symptoms may impact multiple patient activities including, but not limited to, sleep, concentration, day to day activities, or ability to interact with others.',
        A: 'Pain',
        B: 'Shortness of breath',
        C: 'Anxiety',
        D: 'Nausea',
        E: 'Vomiting',
        F: 'Diarrhea',
        G: 'Constipation',
        H: 'Agitation',
    }
} as const;

export const SECTION_J_CODES = {
    J0050,
    J0900A,
    J0900C,
    J0900D,
    J0905,
    J0910A,
    J0910C,
    J0915,
    J2030A,
    J2030C,
    J2040A,
    J2050A,
    J2052A,
    J2052C,
} as const;