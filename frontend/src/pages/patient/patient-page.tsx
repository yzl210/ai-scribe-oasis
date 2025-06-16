'use client';

import {useNavigate, useParams} from 'react-router';
import type * as React from 'react';
import {useEffect, useState} from 'react';
import type {Note, Patient} from '@ai-scribe-oasis/shared/types.ts';
import {motion} from 'framer-motion';
import {ArrowLeft, AudioLines, Calendar, FileText, Hash, MapPin, NotebookPen, Phone, User} from 'lucide-react';
import {getJson} from '@/lib/api.ts';
import {toast} from 'sonner';
import {Skeleton} from '@/components/ui/skeleton.tsx';
import {Button} from '@/components/ui/button.tsx';
import {Card, CardContent} from '@/components/ui/card.tsx';
import {Badge} from '@/components/ui/badge.tsx';
import {getSocket} from '@/lib/socket.ts';
import {cn} from '@/lib/utils';
import {NewNote} from '@/pages/patient/audio-upload.tsx';
import {NoteDetails} from '@/pages/patient/note-details.tsx';
import {NoteStatusBadge} from '@/components/note/note-status-badge.tsx';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from '@/components/ui/resizable';

const PatientPage = () => {
    const {id} = useParams<{ id: string }>();
    if (!id) {
        throw new Error('Patient ID is required');
    }
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient>();
    const [selectedNoteId, setSelectedNoteId] = useState<number>();
    const notes = usePatientNotes(id);

    useEffect(() => {
        if (!id) {
            navigate('/');
            return;
        }
        getJson<Patient>(`/patients/${id}`)
            .then((data) => {
                setPatient(data);
            })
            .catch((e) => {
                toast.error('Failed to load patient data', {
                    description: e.message,
                })
                navigate('/');
            })
    }, [id])

    if (!patient || !notes) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <ResizablePanelGroup direction="horizontal" className="h-screen">
                    <ResizablePanel defaultSize={20} minSize={15}>
                        <div
                            className="bg-white/80 backdrop-blur-sm border-r border-blue-200 shadow-xl p-8 space-y-6 h-full">
                            <Skeleton className="h-8 w-3/4"/>
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-4 w-2/3"/>
                            <Skeleton className="h-4 w-1/2"/>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle/>
                    <ResizablePanel defaultSize={30} minSize={20}>
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-r border-blue-200 p-6 h-full">
                            <Skeleton className="h-8 w-1/2 mb-4"/>
                            <div className="space-y-3">
                                {Array.from({length: 5}).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full"/>
                                ))}
                            </div>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle/>
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <div className="bg-white p-6 h-full">
                            <Skeleton className="h-8 w-1/3 mb-4"/>
                            <Skeleton className="h-64 w-full"/>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        )
    }

    const selectedNote = notes.find((note) => note.id === selectedNoteId);

    const handleSelectNote = (note: Note) => {
        setSelectedNoteId(note.id);
    };

    return (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <motion.div
                className="h-screen"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
            >
                <ResizablePanelGroup direction="horizontal" className="h-full">
                    {/* Patient Info Column */}
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                        <aside
                            className="bg-white/80 backdrop-blur-sm border-r border-blue-200 shadow-xl overflow-y-auto h-full">
                            <div className="p-6 space-y-6">
                                <motion.div
                                    className="space-y-4"
                                    initial={{opacity: 0, x: -20}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{delay: 0.2}}
                                >
                                    {/* Back button */}
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
                                        {patient.address &&
                                            <InfoItem icon={MapPin} label="Address" value={patient.address}/>}
                                    </div>
                                </motion.div>

                                <div className="pt-4">
                                    <NewNote patient={patient}/>
                                </div>
                            </div>
                        </aside>
                    </ResizablePanel>

                    <ResizableHandle withHandle/>

                    {/* Notes List Column */}
                    <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
                        <section
                            className="bg-gradient-to-br from-slate-50 to-blue-50 border-r border-blue-200 overflow-y-auto h-full">
                            <div className="p-6 space-y-4">
                                <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                                            transition={{delay: 0.3}}>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <NotebookPen className="w-5 h-5 text-blue-600"/>
                                        Notes
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                            {notes.length}
                                        </Badge>
                                    </h3>
                                </motion.div>

                                <div className="space-y-2">
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
                                                    className={cn(
                                                        'cursor-pointer transition-all duration-200 border hover:shadow-md',
                                                        selectedNote?.id === note.id
                                                            ? 'bg-blue-50 border-blue-300 shadow-md'
                                                            : 'bg-white/80 border-gray-200 hover:bg-white',
                                                    )}
                                                    onClick={() => handleSelectNote(note)}
                                                >
                                                    <CardContent>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-blue-500"/>
                                                                    <span className="text-xs text-gray-500 font-medium">
                                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                  </span>
                                                                </div>
                                                                <NoteStatusBadge note={note}/>
                                                            </div>

                                                            <div className="space-y-1">
                                                                {note.title ? (
                                                                    <h4 className="font-medium text-gray-800 text-lg truncate">{note.title}</h4>
                                                                ) : (
                                                                    <Skeleton className="h-4 w-full"/>
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
                                            <AudioLines className="w-8 h-8 text-gray-300 mx-auto mb-3"/>
                                            <p className="text-gray-500 text-sm">No notes yet</p>
                                            <p className="text-gray-400 text-xs">Upload an audio file to create your
                                                first note</p>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </ResizablePanel>

                    <ResizableHandle withHandle/>

                    {/* Note Details Column */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <section className="bg-white overflow-y-auto h-full">
                            {selectedNote ? (
                                <NoteDetails note={selectedNote}/>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
                                        <p className="text-gray-500">Select a note to view details</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </motion.div>
        </div>
    )
}

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
    )
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
        }
    }, [patientId])

    useEffect(() => {
        getJson<Note[]>(`/notes/patient/${patientId}`).then(setNotes);
    }, [patientId])

    return notes;
}

export default PatientPage;
