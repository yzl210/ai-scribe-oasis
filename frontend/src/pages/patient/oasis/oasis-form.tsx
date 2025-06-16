import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs.tsx';
import {SectionGForm} from '@/pages/patient/oasis/section-g-form.tsx';
import {SectionGGForm} from '@/pages/patient/oasis/section-gg-form.tsx';
import {FormProps} from '@/pages/patient/form.tsx';
import {OASIS} from '@ai-scribe-oasis/shared/oasis/oasis.ts';
import {useEffect, useState} from 'react';
import {SectionG} from '@ai-scribe-oasis/shared/oasis/section-g.ts';
import {SectionGG} from '@ai-scribe-oasis/shared/oasis/section-gg.ts';

export function OasisForm({initialData, setForm}: FormProps) {
    const initialForm = initialData as OASIS;
    const [G, setG] = useState<SectionG>();
    const [GG, setGG] = useState<SectionGG>();

    useEffect(() => {
        if (G !== undefined || GG !== undefined) {
            setForm({G, GG});
        }
    }, [G, GG]);

    return (
        <Tabs defaultValue="section-g">
            <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="section-g">Section G</TabsTrigger>
                <TabsTrigger value="section-gg">Section GG</TabsTrigger>
            </TabsList>
            <TabsContent value="section-g">
                <SectionGForm initialData={initialForm.G as SectionG} setForm={setG}/>
            </TabsContent>
            <TabsContent value="section-gg">
                <SectionGGForm initialData={initialForm.GG as SectionGG} setForm={setGG}/>
            </TabsContent>
        </Tabs>
    );
}