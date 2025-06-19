'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { ArrowToggles, DateSelect, ScoreSelect, useAccordion } from '@/pages/patient/form.tsx';
import {
    N0500A,
    N0510A,
    N0520A,
    SECTION_N_DESCRIPTIONS,
    SECTION_N_TITLES,
    type SectionN,
    SectionNSchema,
} from '@ai-scribe-oasis/shared/hope/section-n.ts';
import { createNull } from '@ai-scribe-oasis/shared/utils.ts';

export function SectionNForm({ initialData, setForm }: { initialData?: SectionN; setForm: (data: SectionN) => void }) {
    const [data, setData] = useState<SectionN>(initialData || createNull(SectionNSchema));

    const sections = Object.keys(SectionNSchema.shape);
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
                <h2 className="text-lg font-semibold">Section N: Medications</h2>
                <div className="flex-1" />
                <ArrowToggles onExpand={openAll} onCollapse={closeAll} />
            </div>

            <Accordion type="multiple" value={open} onValueChange={setOpen} className="w-full">
                {/* N0500 - Scheduled Opioid */}
                <AccordionItem value="N0500">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">N0500. {SECTION_N_TITLES.N0500}</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">Information about scheduled opioid
                                medications</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-medium">A. {SECTION_N_DESCRIPTIONS.N0500.A}</Label>
                                <ScoreSelect
                                    value={data.N0500?.A || null}
                                    codes={N0500A}
                                    placeholder="Select..."
                                    onChange={(v) => update(['N0500', 'A'], v)}
                                />
                            </div>

                            {data.N0500?.A === '1' && (
                                <div className="space-y-2">
                                    <Label className="font-medium">B. {SECTION_N_DESCRIPTIONS.N0500.B}</Label>
                                    <DateSelect
                                        date={data.N0500?.B ? new Date(data.N0500.B) : undefined}
                                        setDate={(date) => update(['N0500', 'B'], date)}
                                    />
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* N0510 - PRN Opioid */}
                <AccordionItem value="N0510">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">N0510. {SECTION_N_TITLES.N0510}</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">
                                Information about PRN (as needed) opioid medications
                            </p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-medium">A. {SECTION_N_DESCRIPTIONS.N0510.A}</Label>
                                <ScoreSelect
                                    value={data.N0510?.A || null}
                                    codes={N0510A}
                                    placeholder="Select..."
                                    onChange={(v) => update(['N0510', 'A'], v)}
                                />
                            </div>

                            {data.N0510?.A === '1' && (
                                <div className="space-y-2">
                                    <Label className="font-medium">B. {SECTION_N_DESCRIPTIONS.N0510.B}</Label>
                                    <DateSelect
                                        date={data.N0510?.B ? new Date(data.N0510.B) : undefined}
                                        setDate={(date) => update(['N0510', 'B'], date)}
                                    />
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* N0520 - Bowel Regimen */}
                {(data.N0500?.A === '1' || data.N0510?.A === '1') && (
                    <AccordionItem value="N0520">
                        <AccordionTrigger className="text-left">
                            <div>
                                <span className="font-medium">N0520. {SECTION_N_TITLES.N0520}</span>
                                <p className="text-xs text-gray-500 font-normal mt-1">
                                    Information about bowel regimen for patients on opioid therapy
                                </p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="font-medium">A. {SECTION_N_DESCRIPTIONS.N0520.A}</Label>
                                    <ScoreSelect
                                        value={data.N0520?.A || null}
                                        codes={N0520A}
                                        placeholder="Select..."
                                        onChange={(v) => update(['N0520', 'A'], v)}
                                    />
                                </div>

                                {data.N0520?.A === '2' && (
                                    <div className="space-y-2">
                                        <Label className="font-medium">B. {SECTION_N_DESCRIPTIONS.N0520.B}</Label>
                                        <DateSelect
                                            date={data.N0520?.B ? new Date(data.N0520.B) : undefined}
                                            setDate={(date) => update(['N0520', 'B'], date)}
                                        />
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>
        </div>
    );
}
