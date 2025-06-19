'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import type { FormProps } from '@/pages/patient/form.tsx';
import type { HOPE } from '@ai-scribe-oasis/shared/hope/hope.ts';
import { useEffect, useState } from 'react';
import { SectionIForm } from './section-i-form.tsx';
import { SectionJForm } from './section-j-form.tsx';
import { SectionMForm } from './section-m-form.tsx';
import { SectionNForm } from './section-n-form.tsx';
import type { SectionI } from '@ai-scribe-oasis/shared/hope/section-i.ts';
import type { SectionJ } from '@ai-scribe-oasis/shared/hope/section-j.ts';
import type { SectionM } from '@ai-scribe-oasis/shared/hope/section-m.ts';
import type { SectionN } from '@ai-scribe-oasis/shared/hope/section-n.ts';

export function HOPEForm({ initialData, setForm }: FormProps) {
    const initialForm = initialData as HOPE;
    const [I, setI] = useState<SectionI>();
    const [J, setJ] = useState<SectionJ>();
    const [M, setM] = useState<SectionM>();
    const [N, setN] = useState<SectionN>();

    useEffect(() => {
        if (I !== undefined || J !== undefined || M !== undefined || N !== undefined) {
            setForm({ I, J, M, N });
        }
    }, [I, J, M, N]);

    return (
        <Tabs defaultValue="section-i">
            <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="section-i">Section I</TabsTrigger>
                <TabsTrigger value="section-j">Section J</TabsTrigger>
                <TabsTrigger value="section-m">Section M</TabsTrigger>
                <TabsTrigger value="section-n">Section N</TabsTrigger>
            </TabsList>
            <TabsContent value="section-i">
                <SectionIForm initialData={initialForm.I as SectionI} setForm={setI} />
            </TabsContent>
            <TabsContent value="section-j">
                <SectionJForm initialData={initialForm.J as SectionJ} setForm={setJ} />
            </TabsContent>
            <TabsContent value="section-m">
                <SectionMForm initialData={initialForm.M as SectionM} setForm={setM} />
            </TabsContent>
            <TabsContent value="section-n">
                <SectionNForm initialData={initialForm.N as SectionN} setForm={setN} />
            </TabsContent>
        </Tabs>
    );
}