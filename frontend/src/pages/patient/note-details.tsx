'use client';

import React, { useEffect, useState } from 'react';
import { API_BASE, requestJson } from '@/lib/api.ts';
import { toast } from 'sonner';
import { Clock, Edit3, Info, NotebookText, RefreshCw, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Button } from '@/components/ui/button.tsx';
import type { Note, Patient } from '@ai-scribe-oasis/shared/types.ts';
import { FormSelector } from './form-selector.tsx';
import { type Form, FORMS } from '../../../../shared/forms';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { NoteStatusBadge } from '@/components/note/note-status-badge.tsx';
import { OasisForm } from '@/pages/patient/oasis/oasis-form.tsx';
import type { FormProps } from '@/pages/patient/form.tsx';
import { HOPEForm } from '@/pages/patient/hope/hope-form.tsx';
import { AudioRecorder } from '@/pages/patient/audio-recorder.tsx';
import { formatDate } from '@/lib/utils.ts';
import { VisitFormComponent } from '@/pages/patient/visit/visit-form.tsx';

const FORM_COMPONENTS: Record<Form, React.FC<FormProps>> = {
    'home-health-oasis-soc': OasisForm,
    'hospice-hope-soc': HOPEForm,
    'visit-form': VisitFormComponent,
} as const;

interface NoteDetailsProps {
    note: Note | 'new';
    patient: Patient;
    onNoteUpdate?: () => void;
}

export function NoteDetails({ note, patient, onNoteUpdate }: NoteDetailsProps) {
    const [activeTab, setActiveTab] = useState<'info' | Form>('info');
    const [saving, setSaving] = useState(false);
    const [newForms, setNewForms] = useState<Partial<Record<Form, Object>>>({});
    const [key, setKey] = useState(0);

    const isNewNote = note === 'new';
    const actualNote = isNewNote ? null : note;

    useEffect(() => {
        setNewForms({});
        setActiveTab('info');
    }, [note]);

    const forms = actualNote?.forms ? Object.entries(actualNote.forms) : [];
    const hasUnsavedChanges = Object.keys(newForms).length > 0;

    const handleSaveChanges = async () => {
        if (hasUnsavedChanges && actualNote) {
            setSaving(true);
            try {
                await requestJson(`/notes/${actualNote.id}`, 'PATCH', newForms);
                toast.success('Changes saved successfully');
                setNewForms({});
            } catch (err) {
                toast.error('Failed to save changes', { description: String(err) });
            } finally {
                setSaving(false);
            }
        }
    };

    const handleDiscardChanges = () => {
        setNewForms({});
        setKey((prev) => prev + 1);
    };

    if (isNewNote) {
        return (
            <div className="h-full flex flex-col">
                <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30">
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 ml-4">
                                <AudioRecorder patient={patient} mode="new" onSuccess={onNoteUpdate} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="p-6 space-y-6">

                            <div className="text-center py-12 text-gray-500">
                                <Info className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium mb-2">Create Note</p>
                                <p className="text-sm">Record or upload audio to create a new note for this patient.</p>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </div>
        );
    }

    const handleRegenerate = async (form: Form) => {
        try {
            await requestJson(`/notes/${actualNote!.id}/form`, 'POST', { form });
        } catch (err) {
            toast.error('Failed to regenerate form', {
                description: String(err),
            });
        }
    };


    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30">
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-gray-900">{actualNote!.title}</h2>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span>{new Date(actualNote!.createdAt).toLocaleString()}</span>
                                </div>
                                <NoteStatusBadge note={actualNote!} />
                            </div>
                        </div>

                        {note.status === 'READY' && (
                            <div className="flex items-center gap-3 ml-4">
                                <AudioRecorder
                                    patient={patient}
                                    currentNote={actualNote!}
                                    mode="add"
                                    onSuccess={onNoteUpdate}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {hasUnsavedChanges && (
                <div className="px-6 py-3 bg-amber-50 border-b border-amber-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-800">
                            <Edit3 className="w-4 h-4" />
                            <span className="text-sm font-medium">You have unsaved changes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleDiscardChanges}
                                variant="outline"
                                size="sm"
                                className="bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-red-300 text-red-700 hover:text-red-800 shadow-md transition-all duration-200"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Discard Changes
                            </Button>
                            <Button
                                onClick={handleSaveChanges}
                                loading={saving}
                                size="sm"
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md transition-all duration-200"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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
                                <Info className="w-4 h-4" />
                                Note Info
                            </TabsTrigger>
                            {forms.map(([id]) => {
                                return (
                                    <TabsTrigger
                                        key={id}
                                        value={id}
                                        className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-blue-200/50 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-white/50 flex items-center gap-2 relative"
                                    >
                                        <NotebookText />
                                        {FORMS[id as Form]!.shortName}
                                        {Object.keys(newForms).includes(id) && (
                                            <div
                                                className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                        )}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                        {actualNote!.status === 'READY' && (
                            <FormSelector note={actualNote!} />
                        )}
                    </div>
                </div>

                <TabsContent value="info" className="flex-1 overflow-hidden mt-0">
                    <ScrollArea className="h-full">
                        <div className="px-6 pb-6 space-y-6">
                            {actualNote!.summary && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Summary</h3>
                                    <div
                                        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200/50 shadow-sm">
                                        <p className="text-gray-700 text-sm leading-relaxed">{actualNote!.summary}</p>
                                    </div>
                                </div>
                            )}

                            {actualNote!.audios && actualNote!.audios.length > 0 && (
                                <>
                                    <div className="space-y-3">
                                        <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                            Transcript
                                        </h5>
                                        {actualNote!.audios.some(audio => audio.transcript) ? (
                                            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                                <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">
                                                    {actualNote!.audios
                                                        .filter(audio => audio.transcript)
                                                        .map(audio => audio.transcript)
                                                        .join('\n')
                                                    }
                                                </p>
                                            </div>

                                        ) : (
                                            <div
                                                className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-3">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                            Audio Recordings ({actualNote!.audios.length})
                                        </h3>
                                        <div className="space-y-4">
                                            {actualNote!.audios.map((audio, index) => (
                                                <div key={audio.id}
                                                     className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                                                            Recording {index + 1}
                                                        </h4>
                                                        <h4 className="text-xs text-gray-500">
                                                            {formatDate(audio.createdAt)}
                                                        </h4>
                                                    </div>
                                                    <audio controls className="w-full mb-3">
                                                        <source src={`${API_BASE}/notes/audio/${audio.id}`} />
                                                    </audio>

                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                {forms.map(([id, form]) => (
                    <TabsContent key={key + id} value={id} className="flex-1 mt-0">
                        {form ? (
                            <ScrollArea className="h-full">
                                <div className="px-6 pb-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{FORMS[id as Form]!.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{FORMS[id as Form]!.description}</p>
                                        </div>
                                        <Button
                                            onClick={() => handleRegenerate(id as Form)}
                                            disabled={actualNote!.status !== 'READY'}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Regenerate
                                        </Button>
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
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <div key={i} className="space-y-2">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-10 w-full" />
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
