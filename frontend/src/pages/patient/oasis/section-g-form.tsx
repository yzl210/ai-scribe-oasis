import {
    SECTION_G_CODES,
    SECTION_G_DESCRIPTIONS,
    SECTION_G_TITLES,
    type SectionG,
    SectionGSchema,
} from '@ai-scribe-oasis/shared/oasis/section-g.ts';
import { useState } from 'react';
import { ArrowToggles, ScoreSelect, useAccordion } from '@/pages/patient/form.tsx';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.tsx';
import { createNull } from '@ai-scribe-oasis/shared/utils.ts';

export function SectionGForm({ initialData, setForm }: { initialData?: SectionG, setForm: (data: SectionG) => void }) {
    const [data, setData] = useState<SectionG>(initialData || createNull(SectionGSchema));

    const fields = Object.keys(SectionGSchema.shape) as (keyof SectionG)[];
    const { open, setOpen, openAll, closeAll } = useAccordion(fields);

    const handle = (field: keyof SectionG, v: string | null) => {
        const newData = { ...data, [field]: v };
        setData(newData);
        setForm(newData);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 mb-4 items-center">
                <h2 className="text-lg font-semibold">Section G: Functional Status</h2>
                <div className="flex-1" />
                <ArrowToggles onExpand={openAll} onCollapse={closeAll} />
            </div>

            <Accordion type="multiple" value={open} onValueChange={setOpen} className="w-full">
                {fields.map((field) => (
                    <AccordionItem key={field as string} value={field as string}>
                        <AccordionTrigger className="text-left">
                            <div>
                <span className="font-medium">
                  {field}. {SECTION_G_TITLES[field] ?? field}
                </span>
                                <p className="text-xs text-gray-500 font-normal mt-1">
                                    {SECTION_G_DESCRIPTIONS[field]}
                                </p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div>
                                <ScoreSelect
                                    value={data[field]}
                                    codes={SECTION_G_CODES[field]}
                                    placeholder="Select score…"
                                    onChange={(v) => handle(field, v)}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}