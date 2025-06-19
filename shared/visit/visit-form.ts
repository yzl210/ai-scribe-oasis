import { z } from 'zod';

export const VisitTypeEnum = z.enum([
    'Routine',
    'Urgent',
    'Continuous',
    'Telehealth',
]);
export type VisitType = z.infer<typeof VisitTypeEnum>;

export const PainToolEnum = z.enum([
    'Numeric',
    'Verbal',
    'FACES',
]);
export type PainTool = z.infer<typeof PainToolEnum>;

export const VisitFormSchema = z.object({
    visitInformation: z.object({
        visitDateTime: z.coerce.date().nullable(),
        visitType: VisitTypeEnum.nullable(),
        reasonForVisit: z.string().nullable(),
        subjectiveNarrative: z.string().nullable(),
    }),
    symptomAssessment: z.object({
        physicalSymptoms: z.object({
            pain: z.boolean(),
            dyspnea: z.boolean(),
            edema: z.boolean(),
            skinIntegrityIssues: z.boolean(),
            nutritionConcerns: z.boolean(),
            sleepDisturbance: z.boolean(),
        }),
        painAssessmentTool: PainToolEnum.nullable(),
        additionalSymptomDetails: z.string().nullable(),
    }),
    psychologicalCognitive: z.object({
        moodChanges: z.boolean().nullable(),
        anxiety: z.boolean().nullable(),
        depression: z.boolean().nullable(),
        confusion: z.boolean().nullable(),
        cognitiveObservations: z.string().nullable(),
    }),
    interventions: z.object({
        medicationReviewCompleted: z.boolean().nullable(),
        painManagementAdjusted: z.boolean().nullable(),
        nonPharmacologicMeasuresApplied: z.boolean().nullable(),
        interventionDetails: z.string().nullish(),
    }),
    assessmentImpression: z.object({
        clinicalImpression: z.string().nullable(),
    }),
    planOfCare: z.object({
        goalsOfCareConfirmedUpdated: z.boolean().nullable(),
        advanceDirectivesReviewed: z.boolean().nullable(),
        referralsInitiated: z.string().nullable(),
        planNarrative: z.string().nullable(),
    }),
    patientFamilyEducationResponse: z.object({
        diseaseProcessExplained: z.boolean().nullable(),
        medicationPurposeDosingSideEffectsReviewed: z.boolean().nullable(),
        communityResourcesRightsProvided: z.boolean().nullable(),
        educationResponse: z.string().nullable(),
    }),
    careCoordination: z.object({
        notificationsSentTo: z.string().nullable(),
    }),
});

export type VisitForm = z.infer<typeof VisitFormSchema>;
