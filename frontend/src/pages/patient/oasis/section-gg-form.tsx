'use client';

import {useState} from 'react';
import {Label} from '@/components/ui/label';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {Checkbox} from '@/components/ui/checkbox';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';

import {
    GG0100,
    GG_PERFORMANCE,
    GG_WHEELCHAIR_TYPE,
    SECTION_GG_DESCRIPTIONS,
    SECTION_GG_OPTIONS,
    SECTION_GG_TITLES,
    type SectionGG,
    SectionGGSchema,
} from '@ai-scribe-oasis/shared/oasis/section-gg.ts';
import {ArrowToggles, ScoreSelect, useAccordion} from '@/pages/patient/form.tsx';
import {createNull} from '@ai-scribe-oasis/shared/utils.ts';


export function SectionGGForm({initialData, setForm}: { initialData?: SectionGG, setForm: (data: SectionGG) => void }) {
    const [data, setData] = useState<SectionGG>(initialData || createNull(SectionGGSchema));
    const fields = Object.keys(SectionGGSchema.shape);
    const {open, setOpen, openAll, closeAll} = useAccordion(fields);

    const update = (path: (keyof SectionGG)[], cb: (draft: any) => void) => {
        const newData: any = structuredClone(data);
        let node = newData;
        for (let i = 0; i < path.length - 1; i++) node = node[path[i]];
        cb(node[path[path.length - 1]]);
        setData(newData);
        setForm(newData);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 mb-4 items-center">
                <h2 className="text-lg font-semibold">Section GG: Functional Abilities</h2>
                <div className="flex-1"/>
                <ArrowToggles onExpand={openAll} onCollapse={closeAll}/>
            </div>

            <Accordion type="multiple" value={open} onValueChange={setOpen} className="w-full">
                <AccordionItem value="GG0100">
                    <AccordionTrigger>
                        <div className="text-left">
                            <span className="font-medium">GG0100. {SECTION_GG_TITLES.GG0100}</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">
                                {SECTION_GG_DESCRIPTIONS.GG0100}
                            </p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-2 pb-4">
                            {Object.entries(SECTION_GG_OPTIONS.GG0100).map(([k, label]) => (
                                <div key={k} className="space-y-2">
                                    <Label className="font-medium">
                                        {k}. {label}
                                    </Label>
                                    <ScoreSelect
                                        value={data.GG0100[k as keyof typeof data.GG0100]}
                                        codes={GG0100}
                                        onChange={(v) =>
                                            update(['GG0100'], (n: any) => {
                                                n[k] = v;
                                            })
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="GG0110">
                    <AccordionTrigger>
                        <div className="text-left">
                            <span className="font-medium">GG0110. {SECTION_GG_TITLES.GG0110}</span>
                            <p className="text-xs text-gray-500 font-normal mt-1">
                                {SECTION_GG_DESCRIPTIONS.GG0110}
                            </p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-2 pb-4">
                            {Object.entries(SECTION_GG_OPTIONS.GG0110).map(([k, label]) => (
                                <div key={k} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={`GG0110-${k}`}
                                        checked={data.GG0110[k as keyof typeof data.GG0110] === true}
                                        onCheckedChange={(c) =>
                                            update(['GG0110'], (n: any) => {
                                                n[k] = c === true;
                                            })
                                        }
                                    />
                                    <Label htmlFor={`GG0110-${k}`} className="text-sm font-medium">
                                        {k}. {label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="GG0130">
                    <AccordionTrigger>
                        <div className="text-left">
                            <span className="font-medium">GG0130. Self‑Care</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="pt-2 pb-4">
                            <Tabs defaultValue="1">
                                <TabsList className="grid grid-cols-3 mb-4">
                                    {(['1', '4', '3'] as const).map((tp) => (
                                        <TabsTrigger key={tp} value={tp}>
                                            {SECTION_GG_TITLES.GG0130[tp]}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {(['1', '4', '3'] as const).map((tp) => (
                                    <TabsContent key={tp} value={tp} className="space-y-4">
                                        <p className="text-sm text-gray-600">
                                            {SECTION_GG_DESCRIPTIONS.GG0130[tp]}
                                        </p>
                                        {Object.entries(SECTION_GG_OPTIONS.GG0130).map(([k, label]) => {
                                            if (tp === '4' && !['A', 'B', 'C'].includes(k)) return null;
                                            return (
                                                <div key={k} className="space-y-2">
                                                    <Label className="font-medium">
                                                        {k}. {label}
                                                    </Label>
                                                    <ScoreSelect
                                                        value={data.GG0130[tp][k as keyof typeof data.GG0130[typeof tp]]}
                                                        codes={GG_PERFORMANCE}
                                                        placeholder="Select score…"
                                                        onChange={(v) =>
                                                            update(['GG0130'], (n: any) => {
                                                                n[tp][k] = v;
                                                            })
                                                        }
                                                    />
                                                </div>
                                            );
                                        })}
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="GG0170">
                    <AccordionTrigger>
                        <div className="text-left">
                            <span className="font-medium">GG0170. Mobility</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="pt-2 pb-4">
                            <Tabs defaultValue="1">
                                <TabsList className="grid grid-cols-1 mb-4">
                                    <TabsTrigger value="1">
                                        {SECTION_GG_TITLES.GG0170[1]}
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="1" className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        {SECTION_GG_DESCRIPTIONS.GG0170[1]}
                                    </p>

                                    {Object.entries(SECTION_GG_OPTIONS.GG0170).map(([k, label]) => {
                                        if (['Q', 'R', 'RR1', 'S', 'SS1'].includes(k)) return null;
                                        return (
                                            <div key={k} className="space-y-2">
                                                <Label className="font-medium">
                                                    {k}. {label}
                                                </Label>
                                                <ScoreSelect
                                                    value={data.GG0170['1'][k as keyof typeof data.GG0170['1']]}
                                                    codes={GG_PERFORMANCE}
                                                    placeholder="Select score…"
                                                    onChange={(v) =>
                                                        update(['GG0170'], (n: any) => {
                                                            n['1'][k] = v;
                                                        })
                                                    }
                                                />
                                            </div>
                                        );
                                    })}

                                    {/* Wheelchair dependency toggle */}
                                    <div className="space-y-4 pt-4 border-t border-gray-200">
                                        <div className="space-y-2">
                                            <Label className="font-medium">Q. {SECTION_GG_OPTIONS.GG0170.Q}</Label>
                                            <ScoreSelect
                                                value={data.GG0170['1'].Q}
                                                codes={{'0': 'No', '1': 'Yes'}}
                                                onChange={(v) =>
                                                    update(['GG0170'], (n: any) => {
                                                        n['1'].Q = v;
                                                        if (v !== '1') {
                                                            ['R', 'RR1', 'S', 'SS1'].forEach((x) => (n['1'][x] = null));
                                                        }
                                                    })
                                                }
                                            />
                                        </div>

                                        {data.GG0170['1'].Q === '1' && (
                                            <>
                                                {(['R', 'S'] as const).map((k) => (
                                                    <div key={k} className="space-y-2">
                                                        <Label className="font-medium">
                                                            {k}. {SECTION_GG_OPTIONS.GG0170[k]}
                                                        </Label>
                                                        <ScoreSelect
                                                            value={data.GG0170['1'][k] as string | null}
                                                            codes={GG_PERFORMANCE}
                                                            placeholder="Select score…"
                                                            onChange={(v) =>
                                                                update(['GG0170'], (n: any) => {
                                                                    n['1'][k] = v;
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                ))}

                                                {(['RR1', 'SS1'] as const).map((k) => (
                                                    <div key={k} className="space-y-2">
                                                        <Label className="font-medium">
                                                            {k}. {SECTION_GG_OPTIONS.GG0170[k]}
                                                        </Label>
                                                        <ScoreSelect
                                                            value={data.GG0170['1'][k] as string | null}
                                                            codes={GG_WHEELCHAIR_TYPE}
                                                            placeholder="Select type…"
                                                            onChange={(v) =>
                                                                update(['GG0170'], (n: any) => {
                                                                    n['1'][k] = v;
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}

