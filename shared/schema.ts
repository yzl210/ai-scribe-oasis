import { z } from 'zod';

export const CreatePatientSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dob: z.coerce.date(),
    address: z.string().optional(),
    mrn: z.string().optional(),
});

export type CreatePatientForm = z.infer<typeof CreatePatientSchema>