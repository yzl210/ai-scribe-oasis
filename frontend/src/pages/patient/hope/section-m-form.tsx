'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowToggles, ScoreSelect, useAccordion } from '@/pages/patient/form.tsx';
import {
    M1190,
    M1195,
    M1200,
    SECTION_M_DESCRIPTIONS,
    SECTION_M_TITLES,
    type SectionM,
    SectionMSchema,
} from '@ai-scribe-oasis/shared/hope/section-m.ts';
import { createNull } from '@ai-scribe-oasis/shared/utils.ts';

export function SectionMForm({ initialData, setForm }: { initialData?: SectionM; setForm: (data: SectionM) => void }) {
    const [data, setData] = useState<SectionM>(initialData || createNull(SectionMSchema));

    const sections = Object.keys(SectionMSchema.shape);
    const { open, setOpen, openAll, closeAll } = useAccordion(sections);

    const update = (path: (string | number)[], value: any) => {
        const newData = structuredClone(data);
        let current = newData as any;

        // Navigate to the nested property
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                current[path[i]] = {};
            }
            current = current[path[i]];
        }

        // Set the value
        current[path[path.length - 1]] = value;

        setData(newData);
        setForm(newData);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 mb-4 items-center">
                <h2 className="text-lg font-semibold">Section M: Skin Conditions</h2>
                <div className="flex-1" />
                <ArrowToggles onExpand={openAll} onCollapse={closeAll} />
            </div>

            <Accordion type="multiple" value={open} onValueChange={setOpen} className="w-full">
                {/* M1190 - Skin Conditions */}
                <AccordionItem value="M1190">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">M1190. {SECTION_M_TITLES.M1190}</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">{SECTION_M_DESCRIPTIONS.M1190}</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div>
                            <ScoreSelect
                                value={data.M1190}
                                codes={M1190}
                                placeholder="Select..."
                                onChange={(v) => update(['M1190'], v)}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* M1195 - Types of Skin Conditions */}
                {data.M1190 === '1' && (
                    <AccordionItem value="M1195">
                        <AccordionTrigger className="text-left">
                            <div>
                                <span className="font-medium">M1195. {SECTION_M_TITLES.M1195}</span>
                                <p className="text-xs text-gray-500 font-normal mt-1">{SECTION_M_DESCRIPTIONS.M1195}</p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-3">
                                {Object.entries(M1195).map(([key, label]) => (
                                    <div key={key} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`M1195-${key}`}
                                            checked={data.M1195?.[key as keyof typeof M1195] === true}
                                            onCheckedChange={(checked) => update(['M1195', key], checked === true)}
                                        />
                                        <Label htmlFor={`M1195-${key}`} className="text-sm font-medium">
                                            {key}. {label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* M1200 - Skin and Ulcer/Injury Treatments */}
                {data.M1190 === '1' && (
                    <AccordionItem value="M1200">
                        <AccordionTrigger className="text-left">
                            <div>
                                <span className="font-medium">M1200. {SECTION_M_TITLES.M1200}</span>
                                <p className="text-xs text-gray-500 font-normal mt-1">{SECTION_M_DESCRIPTIONS.M1200}</p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-3">
                                {Object.entries(M1200).map(([key, label]) => (
                                    <div key={key} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`M1200-${key}`}
                                            checked={data.M1200?.[key as keyof typeof M1200] === true}
                                            onCheckedChange={(checked) => update(['M1200', key], checked === true)}
                                        />
                                        <Label htmlFor={`M1200-${key}`} className="text-sm font-medium">
                                            {key}. {label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>
        </div>
    );
}
