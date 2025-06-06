'use client';

import {useNavigate, useParams} from 'react-router';
import type * as React from 'react';
import {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {ArrowLeft, AudioLines, Calendar, Edit3, Eye, Hash, MapPin, NotebookPen, Phone, User,} from 'lucide-react';
import {API_BASE, getJson, patchJson} from '@/lib/api.ts';
import {toast} from 'sonner';
import {Skeleton} from '@/components/ui/skeleton.tsx';
import {Button} from '@/components/ui/button.tsx';
import {Sheet, SheetContent, SheetHeader, SheetTitle} from '@/components/ui/sheet.tsx';
import {Card, CardContent} from '@/components/ui/card.tsx';
import {Badge} from '@/components/ui/badge.tsx';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs.tsx';
import {SectionGForm} from './section-g-form';
import {SectionGGForm} from './section-gg-form';
import {getSocket} from '@/lib/socket.ts';
import {NewNote} from '@/pages/patient/audio-upload.tsx';
import {Note, Patient} from '@ai-scribe-oasis/shared/types.ts';
import {SectionG} from '@ai-scribe-oasis/shared/oasis/section-g.ts';
import {SectionGG} from '@ai-scribe-oasis/shared/oasis/section-gg.ts';

const PatientPage = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    if (!id) {
        navigate('/');
        return;
    }
    const [patient, setPatient] = useState<Patient>();
    const [selectedNote, setSelectedNote] = useState<Note>();
    const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
    const notes = usePatientNotes(id);

    useEffect(() => {

        getJson<Patient>(`/patients/${id}`)
            .then((data) => {
                setPatient(data);
            })
            .catch((e) => {
                toast.error('Failed to load patient data', {
                    description: e.message,
                });
                navigate('/');
            });
    }, [id]);

    if (!patient || !notes) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] h-screen">
                    <aside className="bg-white/80 backdrop-blur-sm border-r border-blue-200 shadow-xl p-8 space-y-6">
                        <Skeleton className="h-8 w-3/4"/>
                        <Skeleton className="h-4 w-full"/>
                        <Skeleton className="h-4 w-2/3"/>
                        <Skeleton className="h-4 w-1/2"/>
                    </aside>
                    <section
                        className="bg-gradient-to-br from-slate-50 to-blue-50 p-10 flex items-center justify-center">
                        <Skeleton className="h-8 w-1/3"/>
                    </section>
                </div>
            </div>
        );
    }

    const handleViewNote = async (noteId: number) => {
        setSelectedNote(undefined);
        setViewMode('view');
        try {
            setSelectedNote(notes.find((n) => n.id === noteId));
        } catch (e: any) {
            toast.error('Failed to load note', {description: e.message});
        }
    };

    const handleEditNote = async (noteId: number) => {
        setSelectedNote(undefined);
        setViewMode('edit');
        try {
            setSelectedNote(notes.find((n) => n.id === noteId));
        } catch (e: any) {
            toast.error('Failed to load note', {description: e.message});
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <NoteDetails
                viewMode={viewMode}
                setViewMode={setViewMode}
                selectedNote={selectedNote}
                setSelectedNote={setSelectedNote}
            />
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-screen max-h-screen"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
            >
                <aside className="bg-white/80 backdrop-blur-sm border-r border-blue-200 shadow-xl overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <motion.div
                            className="space-y-4"
                            initial={{opacity: 0, x: -20}}
                            animate={{opacity: 1, x: 0}}
                            transition={{delay: 0.2}}
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/')}
                                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2"
                            >
                                <ArrowLeft className="w-4 h-4"/>
                                Back to patients
                            </Button>

                            <div className="text-center pb-4 border-b border-blue-100">
                                <div
                                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <User className="w-8 h-8 text-white"/>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {patient.firstName} {patient.lastName}
                                </h2>
                            </div>

                            <div className="space-y-3">
                                <InfoItem icon={Hash} label="MRN" value={patient.mrn}/>
                                <InfoItem icon={Calendar} label="DOB"
                                          value={new Date(patient.dob).toLocaleDateString()}/>
                                {patient.phone && <InfoItem icon={Phone} label="Phone" value={patient.phone}/>}
                                {patient.address && <InfoItem icon={MapPin} label="Address" value={patient.address}/>}
                            </div>
                        </motion.div>

                        <div className="pt-4">
                            <NewNote patient={patient}/>
                        </div>
                    </div>
                </aside>

                <section className="bg-gradient-to-br from-slate-50 to-blue-50 overflow-y-auto max-h-screen">
                    <div className="p-6 space-y-4 pb-20">
                        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                                    transition={{delay: 0.3}}>
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <NotebookPen className="w-6 h-6 text-blue-600"/>
                                Medical Notes
                                <Badge variant="secondary" className="ml-2">
                                    {notes.length}
                                </Badge>
                            </h3>
                        </motion.div>

                        <div className="grid gap-4">
                            {notes
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map((note, index) => (
                                    <motion.div
                                        key={note.id}
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: 0.1 * index}}
                                    >
                                        <Card
                                            className="hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0 space-y-3">
                                                        <div className="flex items-center justify-between ml-2">
                                                            <div
                                                                className="flex items-center gap-2 text-sm text-gray-500">
                                                                <Calendar className="w-4 h-4"/>
                                                                <span className="font-medium">
                                  {new Date(note.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  })}
                                </span>
                                                            </div>
                                                            <Badge variant={getNoteStatus(note).variant}
                                                                   className="text-xs">
                                                                {getNoteStatus(note).label}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex items-center gap-2 pt-1">
                                                            <div
                                                                className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <AudioLines className="w-3 h-3 text-blue-600"/>
                                                            </div>

                                                            {note.summary ? (
                                                                <h4 className="font-semibold text-gray-800">{note.summary}</h4>
                                                            ) : (
                                                                <div className="flex-1">
                                                                    <Skeleton className="h-4 w-3/4"/>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleViewNote(note.id)}
                                                            className="bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 min-w-[60px]"
                                                        >
                                                            <Eye className="w-3 h-3 mr-1"/>
                                                            View
                                                        </Button>
                                                        {note.status === 'PROCESSED' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleEditNote(note.id)}
                                                                className="bg-green-50 border-green-200 hover:bg-green-100 text-green-700 min-w-[60px]"
                                                            >
                                                                <Edit3 className="w-3 h-3 mr-1"/>
                                                                Edit
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}

                            {!notes.length && (
                                <motion.div
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    transition={{delay: 0.4}}
                                    className="text-center py-12"
                                >
                                    <AudioLines className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
                                    <p className="text-gray-500 text-lg">No notes yet</p>
                                    <p className="text-gray-400 text-sm">Upload an audio file to create your first
                                        note</p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </section>
            </motion.div>
        </div>
    );
};

function InfoItem({icon: Icon, label, value}: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-blue-600"/>
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
                <p className="text-sm text-gray-800 font-medium truncate">{value}</p>
            </div>
        </div>
    );
}

export function usePatientNotes(patientId: string) {
    const [notes, setNotes] = useState<Note[]>();
    const socket = getSocket();

    useEffect(() => {
        socket.emit('joinPatientRoom', patientId);

        socket.on('noteCreated', (note: Note) => {
            setNotes((prev) => (prev ? [note, ...prev] : [note]));
        });

        socket.on('noteUpdated', (note: Note) => {
            setNotes((prev) => prev?.map((n) => (n.id === note.id ? note : n)) ?? [note]);
        });

        return () => {
            socket.emit('leavePatientRoom', patientId);
            socket.off('noteCreated');
            socket.off('noteUpdated');
        };
    }, [patientId]);

    useEffect(() => {
        getJson<Note[]>(`/notes/patient/${patientId}`).then(setNotes);
    }, [patientId]);

    return notes;
}

function getNoteStatus(note: Note): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
    switch (note.status) {
        case 'PENDING':
            return {label: 'Pending', variant: 'outline'};
        case 'TRANSCRIBING':
            return {label: 'Transcribing', variant: 'secondary'};
        case 'TRANSCRIBED':
            return {label: 'Transcribed', variant: 'default'};
        case 'PROCESSING':
            return {label: 'Processing', variant: 'secondary'};
        case 'PROCESSED':
            return {label: 'Ready', variant: 'default'};
        case 'ERROR':
            return {label: 'Error', variant: 'destructive'};
        default:
            return {label: 'Unknown', variant: 'outline'};
    }
}

function NoteDetails({
                         viewMode,
                         setViewMode,
                         selectedNote,
                         setSelectedNote,
                     }: {
    viewMode: 'view' | 'edit'
    setViewMode: (viewMode: 'view' | 'edit') => void
    selectedNote?: Note
    setSelectedNote: (note?: Note) => void
}) {
    const [saving, setSaving] = useState(false);
    const [oasisG, setOasisG] = useState<SectionG>();
    const [oasisGG, setOasisGG] = useState<SectionGG>();

    useEffect(() => {
        setOasisG(undefined);
        setOasisGG(undefined);
    }, [selectedNote]);

    const handleSaveChanges = async () => {
        if (!selectedNote) {
            return;
        }
        if (oasisG || oasisGG) {
            setSaving(true);
            try {
                await patchJson(
                    `/notes/${selectedNote.id}`,
                    JSON.stringify({
                        oasisG,
                        oasisGG,
                    }),
                );
                toast.success('Changes saved successfully');
                setSelectedNote(undefined);
            } catch (err) {
                toast.error('Failed to save changes', {description: String(err)});
            } finally {
                setSaving(false);
            }
        } else {
            setSelectedNote(undefined);
        }
    };

    return (
        <Sheet
            open={!!selectedNote}
            onOpenChange={(open) => {
                if (!open) setSelectedNote(undefined);
            }}
        >
            <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
                {selectedNote ? (
                    <div className="space-y-6">
                        <SheetHeader>
                            <div className="flex items-center justify-between">
                                <SheetTitle className="text-xl">
                                    {viewMode === 'view' ? 'View Note' : 'Edit Assessment Forms'}
                                </SheetTitle>
                                <Badge variant={getNoteStatus(selectedNote).variant} className="text-xs">
                                    {getNoteStatus(selectedNote).label}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{new Date(selectedNote.createdAt).toLocaleString()}</p>
                        </SheetHeader>

                        {viewMode === 'view' ? (
                            <div className="space-y-6 p-6">
                                {selectedNote.audioUrl && (
                                    <div className="space-y-6">
                                        <h2 className="text-lg font-semibold">Audio Recording</h2>
                                        <audio controls className="w-full">
                                            <source src={`${API_BASE}/notes/audio/${selectedNote.id}`}/>
                                        </audio>
                                    </div>
                                )}
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold">Transcript</h2>
                                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">{selectedNote.transcript}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 p-6">
                                <Tabs defaultValue="section-g">
                                    <TabsList className="grid grid-cols-2">
                                        <TabsTrigger value="section-g">Section G</TabsTrigger>
                                        <TabsTrigger value="section-gg">Section GG</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="section-g" className="mt-4">
                                        <SectionGForm initialData={selectedNote.oasisG} setForm={setOasisG}/>
                                    </TabsContent>
                                    <TabsContent value="section-gg" className="mt-4">
                                        <SectionGGForm initialData={selectedNote.oasisGG} setForm={setOasisGG}/>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setViewMode('view')} className="flex-1">
                                        Cancel
                                    </Button>
                                    <Button loading={saving} onClick={handleSaveChanges} className="flex-1">
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-32">
                        <Skeleton className="h-8 w-3/4"/>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

export default PatientPage;
