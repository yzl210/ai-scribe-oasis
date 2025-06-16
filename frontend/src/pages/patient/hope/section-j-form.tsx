'use client';

import {useState} from 'react';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';
import {ArrowToggles, DateSelect, ScoreSelect, useAccordion} from '@/pages/patient/form.tsx';
import {
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
    J2050A,
    SECTION_J_DESCRIPTIONS,
    SECTION_J_TITLES,
    type SectionJ,
    SectionJSchema,
    SYMPTOM_IMPACTS,
} from '@ai-scribe-oasis/shared/hope/section-j.ts';
import {createNull} from '@ai-scribe-oasis/shared/utils.ts';

export function SectionJForm({initialData, setForm}: { initialData?: SectionJ; setForm: (data: SectionJ) => void }) {
    const [data, setData] = useState<SectionJ>(initialData || createNull(SectionJSchema));

    const sections = Object.keys(SectionJSchema.shape);
    const {open, setOpen, openAll, closeAll} = useAccordion(sections);

    const update = (path: (string | number)[], value: any) => {
        const newData = structuredClone(data);
        let current = newData as any;

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
                <h2 className="text-lg font-semibold">Section J: Pain and Other Symptoms</h2>
                <div className="flex-1"/>
                <ArrowToggles onExpand={openAll} onCollapse={closeAll}/>
            </div>

            <Accordion type="multiple" value={open} onValueChange={setOpen} className="w-full">
                {/* J0050 - Death is Imminent */}
                <AccordionItem value="J0050">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">J0050. {SECTION_J_TITLES.J0050}</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">{SECTION_J_DESCRIPTIONS.J0050}</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div>
                            <ScoreSelect
                                value={data.J0050}
                                codes={J0050}
                                placeholder="Select..."
                                onChange={(v) => update(['J0050'], v)}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* J0900 - Pain Screening */}
                <AccordionItem value="J0900">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">J0900. {SECTION_J_TITLES.J0900}</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">Pain screening assessment</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-medium">A. {SECTION_J_DESCRIPTIONS.J0900.A}</Label>
                                <ScoreSelect
                                    value={data.J0900?.A ?? null}
                                    codes={J0900A}
                                    placeholder="Select..."
                                    onChange={(v) => update(['J0900', 'A'], v)}
                                />
                            </div>

                            {data.J0900?.A === '1' && (
                                <>
                                    <div className="space-y-2">
                                        <Label className="font-medium">B. {SECTION_J_DESCRIPTIONS.J0900.B}</Label>
                                        <DateSelect
                                            date={data.J0900?.B ? new Date(data.J0900.B) : undefined}
                                            setDate={(date) => update(['J0900', 'B'], date)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-medium">C. {SECTION_J_DESCRIPTIONS.J0900.C}</Label>
                                        <ScoreSelect
                                            value={data.J0900?.C}
                                            codes={J0900C}
                                            placeholder="Select pain severity..."
                                            onChange={(v) => update(['J0900', 'C'], v)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-medium">D. {SECTION_J_DESCRIPTIONS.J0900.D}</Label>
                                        <ScoreSelect
                                            value={data.J0900?.D}
                                            codes={J0900D}
                                            placeholder="Select tool type..."
                                            onChange={(v) => update(['J0900', 'D'], v)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* J0905 - Pain Active Problem */}
                <AccordionItem value="J0905">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">J0905. {SECTION_J_TITLES.J0905}</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">{SECTION_J_DESCRIPTIONS.J0905}</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div>
                            <ScoreSelect
                                value={data.J0905}
                                codes={J0905}
                                placeholder="Select..."
                                onChange={(v) => update(['J0905'], v)}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* J0910 - Comprehensive Pain Assessment */}
                <AccordionItem value="J0910">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">J0910. {SECTION_J_TITLES.J0910}</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">Comprehensive assessment of pain</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-medium">A. {SECTION_J_DESCRIPTIONS.J0910.A}</Label>
                                <ScoreSelect
                                    value={data.J0910?.A ?? null}
                                    codes={J0910A}
                                    placeholder="Select..."
                                    onChange={(v) => update(['J0910', 'A'], v)}
                                />
                            </div>

                            {data.J0910?.A === '1' && (
                                <>
                                    <div className="space-y-2">
                                        <Label className="font-medium">B. {SECTION_J_DESCRIPTIONS.J0910.B}</Label>
                                        <DateSelect
                                            date={data.J0910?.B ? new Date(data.J0910.B) : undefined}
                                            setDate={(date) => update(['J0910', 'B'], date)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-medium">C. {SECTION_J_DESCRIPTIONS.J0910.C}</Label>
                                        <div className="space-y-3 pt-2">
                                            {Object.entries(J0910C).map(([key, label]) => (
                                                <div key={key} className="flex items-center space-x-3">
                                                    <Checkbox
                                                        id={`J0910C-${key}`}
                                                        checked={data.J0910?.C?.[key as keyof typeof J0910C] === true}
                                                        onCheckedChange={(checked) => update(['J0910', 'C', key], checked === true)}
                                                    />
                                                    <Label htmlFor={`J0910C-${key}`} className="text-sm font-medium">
                                                        {key}. {label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* J0915 - Neuropathic Pain */}
                <AccordionItem value="J0915">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">J0915. {SECTION_J_TITLES.J0915}</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">{SECTION_J_DESCRIPTIONS.J0915}</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div>
                            <ScoreSelect
                                value={data.J0915}
                                codes={J0915}
                                placeholder="Select..."
                                onChange={(v) => update(['J0915'], v)}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* J2030 - Screening for Shortness of Breath */}
                <AccordionItem value="J2030">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">J2030. {SECTION_J_TITLES.J2030}</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">Assessment of breathing difficulty</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-medium">A. {SECTION_J_DESCRIPTIONS.J2030.A}</Label>
                                <ScoreSelect
                                    value={data.J2030?.A ?? null}
                                    codes={J2030A}
                                    placeholder="Select..."
                                    onChange={(v) => update(['J2030', 'A'], v)}
                                />
                            </div>

                            {data.J2030?.A === '1' && (
                                <>
                                    <div className="space-y-2">
                                        <Label className="font-medium">B. {SECTION_J_DESCRIPTIONS.J2030.B}</Label>
                                        <DateSelect
                                            date={data.J2030?.B ? new Date(data.J2030.B) : undefined}
                                            setDate={(date) => update(['J2030', 'B'], date)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-medium">C. {SECTION_J_DESCRIPTIONS.J2030.C}</Label>
                                        <ScoreSelect
                                            value={data.J2030?.C}
                                            codes={J2030C}
                                            placeholder="Select..."
                                            onChange={(v) => update(['J2030', 'C'], v)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* J2050 - Symptom Impact Screening */}
                <AccordionItem value="J2050">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">J2050. {SECTION_J_TITLES.J2050}</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">Assessment of symptom impact</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-medium">A. {SECTION_J_DESCRIPTIONS.J2050.A}</Label>
                                <ScoreSelect
                                    value={data.J2050?.A ?? null}
                                    codes={J2050A}
                                    placeholder="Select..."
                                    onChange={(v) => update(['J2050', 'A'], v)}
                                />
                            </div>

                            {data.J2050?.A === '1' && (
                                <div className="space-y-2">
                                    <Label className="font-medium">B. {SECTION_J_DESCRIPTIONS.J2050.B}</Label>
                                    <DateSelect
                                        date={data.J2050?.B ? new Date(data.J2050.B) : undefined}
                                        setDate={(date) => update(['J2050', 'B'], date)}
                                    />
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* J2051 - Symptom Impact */}
                <AccordionItem value="J2051">
                    <AccordionTrigger className="text-left">
                        <div>
                            <span className="font-medium">J2051. {SECTION_J_TITLES.J2051}</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">{SECTION_J_DESCRIPTIONS.J2051._}</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((item) => (
                                <div key={item} className="space-y-2">
                                    <Label className="font-medium">
                                        {item}. {SECTION_J_DESCRIPTIONS.J2051[item as keyof typeof SECTION_J_DESCRIPTIONS.J2051]}
                                    </Label>
                                    <ScoreSelect
                                        value={data.J2051?.[item as keyof typeof data.J2051]}
                                        codes={SYMPTOM_IMPACTS}
                                        placeholder="Select impact level..."
                                        onChange={(v) => update(['J2051', item], v)}
                                    />
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
