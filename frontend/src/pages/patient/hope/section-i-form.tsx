'use client';

import {useState} from 'react';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {
    I0010,
    SECTION_I_CATEGORIES,
    SECTION_I_TITLES,
    type SectionI,
    SectionISchema,
} from '@ai-scribe-oasis/shared/hope/section-i.ts';
import {createNull} from '@ai-scribe-oasis/shared/utils.ts';
import {Separator} from '@/components/ui/separator';

export function SectionIForm({initialData, setForm}: { initialData?: SectionI; setForm: (data: SectionI) => void }) {
    const [data, setData] = useState<SectionI>(initialData || createNull(SectionISchema));

    const categories = Object.entries(SECTION_I_CATEGORIES);

    const handlePrincipalDiagnosis = (value: string | null) => {
        const newData = {...data, I0010: value} as SectionI;
        setData(newData);
        setForm(newData);
    };

    const handleCondition = (field: keyof SectionI, checked: boolean | 'indeterminate') => {
        const newData = {...data, [field]: checked === true} as any;
        setData(newData);
        setForm(newData);
    };

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h2 className="text-lg font-semibold">Section I: Principal Diagnosis & Diagnoses</h2>
            </div>

            {/* Principal Diagnosis */}
            <div className="space-y-3 mb-6">
                <Label className="font-medium">I0010. Principal Diagnosis</Label>
                <Select value={data.I0010 || ''} onValueChange={handlePrincipalDiagnosis}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select principal diagnosis"/>
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(I0010).map(([code, description]) => (
                            <SelectItem key={code} value={code}>
                                {code}: {description}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Diagnoses by Category */}
            <div className="space-y-6">
                {categories.map(([category, fields], index) => (
                    <div key={category}>
                        {index > 0 && <Separator className="mb-4"/>}
                        <div className="space-y-3">
                            <h3 className="font-medium text-gray-700">{category}</h3>
                            {fields.map((field) => {
                                return (
                                    <div key={field} className="flex items-center space-x-3 ml-2">
                                        <Checkbox
                                            id={field}
                                            checked={data[field as keyof SectionI] as any === true}
                                            onCheckedChange={(checked) => handleCondition(field as keyof SectionI, checked)}
                                        />
                                        <Label htmlFor={field} className="text-sm">
                                            {field}. {SECTION_I_TITLES[field as keyof typeof SECTION_I_TITLES]}
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
