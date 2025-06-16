'use client';

import React, {useEffect, useState} from 'react';
import {API_BASE, requestJson} from '@/lib/api.ts';
import {toast} from 'sonner';
import {Clock, Edit3, FileText, Info} from 'lucide-react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs.tsx';
import {Button} from '@/components/ui/button.tsx';
import type {Note} from '@ai-scribe-oasis/shared/types.ts';
import {FormSelector} from './form-selector.tsx';
import {type Form, FORMS} from '../../../../shared/forms';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Skeleton} from '@/components/ui/skeleton';
import {NoteStatusBadge} from '@/components/note/note-status-badge.tsx';
import {OasisForm} from '@/pages/patient/oasis/oasis-form.tsx';
import type {FormProps} from '@/pages/patient/form.tsx';
import {HOPEForm} from '@/pages/patient/hope/hope-form.tsx';

const FORM_COMPONENTS: Record<Form, React.FC<FormProps>> = {
    'home-health-oasis-soc': OasisForm,
    'hospice-hope-soc': HOPEForm,
} as const;

export function NoteDetails({note}: { note: Note }) {
    const [activeTab, setActiveTab] = useState<'info' | Form>('info');
    const [saving, setSaving] = useState(false);
    const [newForms, setNewForms] = useState<Partial<Record<Form, Object>>>({});

    useEffect(() => {
        setNewForms({});
    }, [note]);

    const forms = note.forms ? Object.entries(note.forms) : [];
    const hasUnsavedChanges = Object.keys(newForms).length > 0;

    const handleSaveChanges = async () => {
        console.log(newForms);
        if (hasUnsavedChanges) {
            setSaving(true);
            try {
                await requestJson(`/notes/${note.id}`, 'PATCH', newForms);
                toast.success('Changes saved successfully');
                setNewForms({});
            } catch (err) {
                toast.error('Failed to save changes', {description: String(err)});
            } finally {
                setSaving(false);
            }
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30">
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-gray-900">{note.title}</h2>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4"/>
                                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                                </div>
                                <NoteStatusBadge note={note}/>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 ml-4">
                            {hasUnsavedChanges && (
                                <Button
                                    onClick={handleSaveChanges}
                                    loading={saving}
                                    size="sm"
                                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md transition-all duration-200"
                                >
                                    <Edit3 className="w-4 h-4 mr-2"/>
                                    Save Changes
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}
                  className="flex-1 flex flex-col">
                <div className="px-6 pt-6 pb-2">
                    <div className="flex items-center justify-between">
                        <TabsList
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 shadow-sm p-0.5 rounded-xl backdrop-blur-sm">
                            <TabsTrigger
                                value="info"
                                className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-blue-200/50 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-white/50 flex items-center gap-2"
                            >
                                <Info className="w-4 h-4"/>
                                Note Info
                            </TabsTrigger>
                            {forms.map(([id]) => {
                                return (
                                    <TabsTrigger
                                        key={id}
                                        value={id}
                                        className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-blue-200/50 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-white/50 flex items-center gap-2 relative"
                                    >
                                        <FileText className="w-4 h-4"/>
                                        {FORMS[id as Form]!.shortName}
                                        {Object.keys(newForms).includes(id) && (
                                            <div
                                                className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"/>
                                        )}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                        <FormSelector note={note}/>
                    </div>
                </div>

                <TabsContent value="info" className="flex-1 overflow-hidden mt-0">
                    <ScrollArea className="h-full">
                        <div className="px-6 pb-6 space-y-6">
                            {note.summary && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Summary</h3>
                                    <div
                                        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200/50 shadow-sm">
                                        <p className="text-gray-700 text-sm leading-relaxed">{note.summary}</p>
                                    </div>
                                </div>
                            )}

                            {note.audioUrl && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Audio
                                        Recording</h3>
                                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                        <audio controls className="w-full">
                                            <source src={`${API_BASE}/notes/audio/${note.id}`}/>
                                        </audio>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Transcript</h3>
                                {note.transcript ? (
                                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                        <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">{note.transcript}</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-3">
                                        <Skeleton className="h-4 w-full"/>
                                        <Skeleton className="h-4 w-3/4"/>
                                        <Skeleton className="h-4 w-full"/>
                                        <Skeleton className="h-4 w-1/2"/>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </TabsContent>

                {forms.map(([id, form]) => (
                    <TabsContent key={id} value={id} className="flex-1 mt-0">
                        {form ? (
                            <ScrollArea className="h-full">
                                <div className="px-6 pb-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{FORMS[id as Form]!.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{FORMS[id as Form]!.description}</p>
                                        </div>
                                    </div>
                                    {React.createElement(FORM_COMPONENTS[id as Form], {
                                        initialData: form!,
                                        setForm: (data: Object) =>
                                            setNewForms((prev) => ({
                                                ...prev,
                                                [id as Form]: data,
                                            })),
                                    })}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="p-6">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            {Array.from({length: 6}).map((_, i) => (
                                                <div key={i} className="space-y-2">
                                                    <Skeleton className="h-4 w-24"/>
                                                    <Skeleton className="h-10 w-full"/>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
