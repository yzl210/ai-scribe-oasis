import {z} from 'zod';
import {keysToSchema, zodEnumFromObject} from '../utils';

/* Section GG: Functional Abilities */

export const GG0100 = {
    '3': 'Independent – Patient completed all the activities by themself, with or without an assistive device, with no assistance from a helper.',
    '2': 'Needed Some Help – Patient needed partial assistance from another person to complete any activities.',
    '1': 'Dependent – A helper completed all the activities for the patient.',
    '8': 'Unknown',
    '9': 'Not Applicable',
};
export const GG0100Schema = zodEnumFromObject(GG0100);

export const GG_PERFORMANCE = {
    '06': 'Independent – Patient completes the activity by themself with no assistance from a helper.',
    '05': 'Setup or clean-up assistance – Helper sets up or cleans up; patient completes activity. Helper assists only prior to or following the activity.',
    '04': 'Supervision or touching assistance – Helper provides verbal cues and/or touching/steadying and/or contact guard assistance as patient completes activity. Assistance may be provided throughout the activity or intermittently',
    '03': 'Partial/moderate assistance – Helper does LESS THAN HALF the effort. Helper lifts, holds or supports trunk or limbs, but provides less than half the effort.',
    '02': 'Substantial/maximal assistance – Helper does MORE THAN HALF the effort. Helper lifts or holds trunk or limbs and provides more than half the effort.',
    '01': 'Dependent – Helper does ALL of the effort. Patient does none of the effort to complete the activity. Or, the assistance of 2 or more helpers is required for the patient to complete the activity.',
    '07': 'Patient refused',
    '09': 'Not applicable – Not attempted and the patient did not perform this activity prior to the current illness, exacerbation or injury.',
    '10': 'Not attempted due to environmental limitations (e.g., lack of equipment, weather constraints)',
    '88': 'Not attempted due to medical conditions or safety concerns'
} as const;
export const GGPerformanceSchema = zodEnumFromObject(GG_PERFORMANCE);

export const GG_WHEELCHAIR_TYPE = {
    '1': 'Manual',
    '2': 'Motorized',
};
export const GGWheelchairTypeSchema = zodEnumFromObject(GG_WHEELCHAIR_TYPE);

export const SECTION_GG_CODES = {
    GG0100,
    GG_PERFORMANCE,
    GG_WHEELCHAIR_TYPE
};

export const SectionGGSchema = z.object({
    GG0100: z.object(keysToSchema(['A', 'B', 'C', 'D'], GG0100Schema.nullable())),
    GG0110: z.object(keysToSchema(['A', 'B', 'C', 'D', 'E', 'Z'], z.boolean().nullable())),
    GG0130: z.object({
        1: z.object(keysToSchema(['A', 'B', 'C', 'E', 'F', 'G', 'H'], GGPerformanceSchema.nullable())),
        4: z.object(keysToSchema(['A', 'B', 'C'], GGPerformanceSchema.nullable())),
        3: z.object(keysToSchema(['A', 'B', 'C', 'E', 'F', 'G', 'H'], GGPerformanceSchema.nullable())),
    }),
    GG0170: z.object({
        1: z.object({
            ...keysToSchema(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'], GGPerformanceSchema.nullable()),
            Q: z.enum(['0', '1']).nullable(),
            R: GGPerformanceSchema.nullable(),
            RR1: GGWheelchairTypeSchema.nullable(),
            S: GGPerformanceSchema.nullable(),
            SS1: GGWheelchairTypeSchema.nullable(),
        }),
    })
});

export type SectionGG = z.infer<typeof SectionGGSchema>;

export const SECTION_GG_TITLES = {
    GG0100: 'Prior Functioning: Everyday Activities',
    GG0110: 'Prior Device Use',
    GG0130: {
        1: 'Self-Care - SOC/ROC',
        4: 'Self-Care - Follow-up',
        3: 'Self-Care - Discharge',
    },
    GG0170: {
        1: 'Mobility - SOC/ROC',
        4: 'Mobility - Follow-up',
        3: 'Mobility - Discharge'
    }
} as const;

export const SECTION_GG_DESCRIPTIONS = {
    GG0100: 'Indicate the patient’s usual ability with everyday activities prior to the current illness, exacerbation, or injury.',
    GG0110: 'Indicate devices and aids used by the patient prior to the current illness, exacerbation, or injury.',
    GG0130: {
        1: 'Code the patient’s usual performance at SOC/ROC for each activity using the 6-point scale. If activity was not attempted at SOC/ ROC, code the reason.',
        4: 'Code the patient’s usual performance at Follow-up for each activity using the 6-point scale. If activity was not attempted at Follow-up, code the reason.',
        3: 'Code the patient’s usual performance at Discharge for each activity using the 6-point scale. If activity was not attempted at Discharge, code the reason.'
    },
    GG0170: {
        1: 'Code the patient’s usual performance at SOC/ROC for each activity using the 6-point scale. If activity was not attempted at SOC/ ROC, code the reason.',
        4: 'Code the patient’s usual performance at Follow-up for each activity using the 6-point scale. If activity was not attempted at Follow-up code the reason.',
        3: 'Code the patient’s usual performance at Discharge for each activity using the 6-point scale. If activity was not attempted at Discharge, code the reason.'
    }
} as const;

export const SECTION_GG_OPTIONS = {
    GG0100: {
        A: 'Self Care: Code the patient’s need for assistance with bathing, dressing, using the toilet, and eating prior to the current illness, exacerbation, or injury.',
        B: 'Indoor Mobility (Ambulation): Code the patient’s need for assistance with walking from room to room (with or without a device such as cane, crutch or walker) prior to the current illness, exacerbation, or injury.',
        C: 'Stairs: Code the patient’s need for assistance with internal or external stairs (with or without a device such as cane, crutch, or walker) prior to the current illness, exacerbation, or injury.',
        D: 'Functional Cognition: Code the patient’s need for assistance with planning regular tasks, such as shopping or remembering to take medication prior to the current illness, exacerbation, or injury.'
    },
    GG0110: {
        A: 'Manual wheelchair',
        B: 'Motorized wheelchair and/or scooter',
        C: 'Mechanical lift',
        D: 'Walker',
        E: 'Orthotics/prosthetics',
        Z: 'None of the above'
    },
    GG0130: {
        A: 'Eating: The ability to use suitable utensils to bring food and/or liquid to the mouth and swallow food and/or liquid once the meal is placed before the patient.',
        B: 'Oral Hygiene: The ability to use suitable items to clean teeth. Dentures (if applicable): The ability to insert and remove dentures into and from mouth, and manage denture soaking and rinsing with use of equipment.',
        C: 'Toileting Hygiene: The ability to maintain perineal hygiene, adjust clothes before and after voiding or having a bowel movement. If managing an ostomy, include wiping the opening but not managing equipment.',
        E: 'Shower/bathe self: The ability to bathe self, including washing, rinsing, and drying self (excludes washing of back and hair). Does not include transferring in/out of tub/shower.',
        F: 'Upper body dressing: The ability to dress and undress above the waist; including fasteners, if applicable',
        G: 'Lower body dressing: The ability to dress and undress below the waist, including fasteners; does not include footwear.',
        H: 'Putting on/taking off footwear: The ability to put on and take off socks and shoes or other footwear that is appropriate for safe mobility; including fasteners, if applicable.',
    },
    GG0170: {
        A: 'Roll left and right: The ability to roll from lying on back to left and right side, and return to lying on back on the bed.',
        B: 'Sit to lying: The ability to move from sitting on side of bed to lying flat on the bed.',
        C: 'Lying to sitting on side of bed: The ability to move from lying on the back to sitting on the side of the bed with no back support.',
        D: 'Sit to stand: The ability to come to a standing position from sitting in a chair, wheelchair, or on the side of the bed.',
        E: 'Chair/bed-to-chair transfer The ability to transfer to and from a bed to a chair (or wheelchair).',
        F: 'Toilet transfer: The ability to get on and off a toilet or commode.',
        G: 'Car transfer: The ability to transfer in and out of a car or van on the passenger side. Does not include the ability to open/close door or fasten seat belt.',
        I: 'Walk 10 feet: Once standing, the ability to walk at least 10 feet in a room, corridor, or similar space.',
        J: 'Walk 50 feet with two turns: Once standing, the ability to walk 50 feet and make two turns.',
        K: 'Walk 150 feet: Once standing, the ability to walk at least 150 feet in a corridor or similar space.',
        L: 'Walking 10 feet on uneven surfaces: The ability to walk 10 feet on uneven or sloping surfaces (indoor or outdoor), such as turf or gravel.',
        M: '1 step (curb): The ability to go up and down a curb or up and down one step. If SOC/ROC performance is coded 07, 09, 10 or 88 → Skip to GG0170P, Picking up object.',
        N: '4 steps: The ability to go up and down four steps with or without a rail. If SOC/ROC performance is coded 07, 09, 10 or 88 → Skip to GG0170P, Picking up object.',
        O: '12 steps: The ability to go up and down 12 steps with or without a rail.',
        P: 'Picking up object: The ability to bend/stoop from a standing position to pick up a small object, such as a spoon, from the floor.',
        Q: 'Does patient use wheelchair and/or scooter  ?',
        R: 'Wheel 50 feet with two turns: Once seated in wheelchair/scooter, the ability to wheel at least 50 feet and make two turns.',
        RR1: 'Indicate the type of wheelchair or scooter used',
        S: 'Wheel 150 feet: Once seated in wheelchair/scooter, the ability to wheel at least 150 feet in a corridor or similar space.',
        SS1: 'Indicate the type of wheelchair or scooter used',
    }
} as const;
