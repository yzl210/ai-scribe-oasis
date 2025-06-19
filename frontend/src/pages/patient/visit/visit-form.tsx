import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PainToolEnum, type VisitForm, VisitFormSchema, VisitTypeEnum } from '@ai-scribe-oasis/shared/visit/visit-form';
import { ArrowToggles, DateTimeSelect, useAccordion } from '@/pages/patient/form.tsx';
import { useState } from 'react';
import { createNull } from '@ai-scribe-oasis/shared/utils.ts';

export function VisitFormComponent({
                                       initialData,
                                       setForm,
                                   }: {
    initialData?: Object
    setForm: (data: VisitForm) => void
}) {
    const [data, setData] = useState<VisitForm>(initialData as VisitForm || createNull(VisitFormSchema));

    const sections = [
        'visitInformation',
        'symptomAssessment',
        'psychologicalCognitive',
        'interventions',
        'assessmentImpression',
        'planOfCare',
        'patientFamilyEducationResponse',
        'careCoordination',
    ];
    const { open, setOpen, openAll, closeAll } = useAccordion(sections);

    const update = (path: (string | number)[], value: any) => {
        const newData = structuredClone(data);
        let current = newData as any;

        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                current[path[i]] = {};
            }
            current = current[path[i]];
        }

        current[path[path.length - 1]] = value;

        setData(newData);
        setForm(newData);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 mb-4 items-center">
                <h2 className="text-lg font-semibold">Visit Documentation Form</h2>
                <div className="flex-1" />
                <ArrowToggles onExpand={openAll} onCollapse={closeAll} />
            </div>

            <Accordion type="multiple" value={open} onValueChange={setOpen} className="w-full">
                {/* Visit Information */}
                <AccordionItem value="visitInformation">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">Visit Information</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">
                                Basic information about the visit
                            </p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-2 pb-4">
                            <div className="space-y-2">
                                <Label className="font-medium">Visit Date & Time</Label>
                                <DateTimeSelect
                                    date={data.visitInformation.visitDateTime ? new Date(data.visitInformation.visitDateTime) : undefined}
                                    setDate={(date) => update(['visitInformation', 'visitDateTime'], date)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">Visit Type</Label>
                                <Select
                                    value={data.visitInformation.visitType || ''}
                                    onValueChange={(value) => update(['visitInformation', 'visitType'], value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select visit type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {VisitTypeEnum.options.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">Reason for Visit</Label>
                                <Textarea
                                    value={data.visitInformation.reasonForVisit || ''}
                                    onChange={(e) => update(['visitInformation', 'reasonForVisit'], e.target.value)}
                                    placeholder="Enter reason for visit..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">Subjective Narrative</Label>
                                <Textarea
                                    value={data.visitInformation.subjectiveNarrative || ''}
                                    onChange={(e) => update(['visitInformation', 'subjectiveNarrative'], e.target.value)}
                                    placeholder="Enter subjective narrative..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Symptom Assessment */}
                <AccordionItem value="symptomAssessment">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">Symptom Assessment</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">
                                Assessment of physical symptoms and pain
                            </p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-2 pb-4">
                            <div className="space-y-3">
                                <Label className="font-medium">Physical Symptoms</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries({
                                        pain: 'Pain',
                                        dyspnea: 'Dyspnea',
                                        edema: 'Edema',
                                        skinIntegrityIssues: 'Skin Integrity Issues',
                                        nutritionConcerns: 'Nutrition Concerns',
                                        sleepDisturbance: 'Sleep Disturbance',
                                    }).map(([key, label]) => (
                                        <div key={key} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`symptom-${key}`}
                                                checked={data.symptomAssessment.physicalSymptoms[key as keyof typeof data.symptomAssessment.physicalSymptoms] === true}
                                                onCheckedChange={(checked) =>
                                                    update(['symptomAssessment', 'physicalSymptoms', key], checked === true)
                                                }
                                            />
                                            <Label htmlFor={`symptom-${key}`} className="text-sm">
                                                {label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">Pain Assessment Tool</Label>
                                <Select
                                    value={data.symptomAssessment.painAssessmentTool || ''}
                                    onValueChange={(value) => update(['symptomAssessment', 'painAssessmentTool'], value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select pain assessment tool" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PainToolEnum.options.map((tool) => (
                                            <SelectItem key={tool} value={tool}>
                                                {tool}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">Additional Symptom Details</Label>
                                <Textarea
                                    value={data.symptomAssessment.additionalSymptomDetails || ''}
                                    onChange={(e) => update(['symptomAssessment', 'additionalSymptomDetails'], e.target.value)}
                                    placeholder="Enter additional symptom details..."
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Psychological/Cognitive */}
                <AccordionItem value="psychologicalCognitive">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">Psychological/Cognitive Assessment</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">
                                Assessment of psychological and cognitive status
                            </p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-2 pb-4">
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries({
                                    moodChanges: 'Mood Changes',
                                    anxiety: 'Anxiety',
                                    depression: 'Depression',
                                    confusion: 'Confusion',
                                }).map(([key, label]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`psych-${key}`}
                                            checked={data.psychologicalCognitive[key as keyof typeof data.psychologicalCognitive] === true}
                                            onCheckedChange={(checked) =>
                                                update(['psychologicalCognitive', key], checked === true)
                                            }
                                        />
                                        <Label htmlFor={`psych-${key}`} className="text-sm">
                                            {label}
                                        </Label>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">Cognitive Observations</Label>
                                <Textarea
                                    value={data.psychologicalCognitive.cognitiveObservations || ''}
                                    onChange={(e) => update(['psychologicalCognitive', 'cognitiveObservations'], e.target.value)}
                                    placeholder="Enter cognitive observations..."
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Interventions */}
                <AccordionItem value="interventions">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">Interventions</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">
                                Interventions performed during the visit
                            </p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-2 pb-4">
                            <div className="space-y-3">
                                {Object.entries({
                                    medicationReviewCompleted: 'Medication Review Completed',
                                    painManagementAdjusted: 'Pain Management Adjusted',
                                    nonPharmacologicMeasuresApplied: 'Non-Pharmacologic Measures Applied',
                                }).map(([key, label]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`intervention-${key}`}
                                            checked={data.interventions[key as keyof typeof data.interventions] === true}
                                            onCheckedChange={(checked) =>
                                                update(['interventions', key], checked === true)
                                            }
                                        />
                                        <Label htmlFor={`intervention-${key}`} className="text-sm">
                                            {label}
                                        </Label>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">Intervention Details</Label>
                                <Textarea
                                    value={data.interventions.interventionDetails || ''}
                                    onChange={(e) => update(['interventions', 'interventionDetails'], e.target.value)}
                                    placeholder="Enter intervention details..."
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Assessment/Impression */}
                <AccordionItem value="assessmentImpression">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">Assessment/Impression</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">
                                Clinical assessment and impression
                            </p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-2 pb-4">
                            <div className="space-y-2">
                                <Label className="font-medium">Clinical Impression</Label>
                                <Textarea
                                    value={data.assessmentImpression.clinicalImpression || ''}
                                    onChange={(e) => update(['assessmentImpression', 'clinicalImpression'], e.target.value)}
                                    placeholder="Enter clinical impression..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Plan of Care */}
                <AccordionItem value="planOfCare">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">Plan of Care</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">
                                Care planning and coordination
                            </p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-2 pb-4">
                            <div className="space-y-3">
                                {Object.entries({
                                    goalsOfCareConfirmedUpdated: 'Goals of Care Confirmed/Updated',
                                    advanceDirectivesReviewed: 'Advance Directives Reviewed',
                                }).map(([key, label]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`plan-${key}`}
                                            checked={data.planOfCare[key as keyof typeof data.planOfCare] === true}
                                            onCheckedChange={(checked) =>
                                                update(['planOfCare', key], checked === true)
                                            }
                                        />
                                        <Label htmlFor={`plan-${key}`} className="text-sm">
                                            {label}
                                        </Label>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">Referrals Initiated</Label>
                                <Textarea
                                    value={data.planOfCare.referralsInitiated || ''}
                                    onChange={(e) => update(['planOfCare', 'referralsInitiated'], e.target.value)}
                                    placeholder="Enter referrals initiated..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">Plan Narrative</Label>
                                <Textarea
                                    value={data.planOfCare.planNarrative || ''}
                                    onChange={(e) => update(['planOfCare', 'planNarrative'], e.target.value)}
                                    placeholder="Enter plan narrative..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Patient/Family Education Response */}
                <AccordionItem value="patientFamilyEducationResponse">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">Patient/Family Education Response</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">
                                Education provided and patient/family response
                            </p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-2 pb-4">
                            <div className="space-y-3">
                                {Object.entries({
                                    diseaseProcessExplained: 'Disease Process Explained',
                                    medicationPurposeDosingSideEffectsReviewed: 'Medication Purpose/Dosing/Side Effects Reviewed',
                                    communityResourcesRightsProvided: 'Community Resources & Rights Provided',
                                }).map(([key, label]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`education-${key}`}
                                            checked={data.patientFamilyEducationResponse[key as keyof typeof data.patientFamilyEducationResponse] === true}
                                            onCheckedChange={(checked) =>
                                                update(['patientFamilyEducationResponse', key], checked === true)
                                            }
                                        />
                                        <Label htmlFor={`education-${key}`} className="text-sm">
                                            {label}
                                        </Label>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">Education Response</Label>
                                <Textarea
                                    value={data.patientFamilyEducationResponse.educationResponse || ''}
                                    onChange={(e) => update(['patientFamilyEducationResponse', 'educationResponse'], e.target.value)}
                                    placeholder="Enter patient/family education response..."
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Care Coordination */}
                <AccordionItem value="careCoordination">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">Care Coordination</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">
                                Communication and coordination activities
                            </p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-2 pb-4">
                            <div className="space-y-2">
                                <Label className="font-medium">Notifications Sent To</Label>
                                <Textarea
                                    value={data.careCoordination.notificationsSentTo || ''}
                                    onChange={(e) => update(['careCoordination', 'notificationsSentTo'], e.target.value)}
                                    placeholder="Enter who notifications were sent to..."
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}