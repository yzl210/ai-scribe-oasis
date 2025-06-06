'use client';

import {useEffect, useMemo, useState} from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select.tsx';
import {Calendar, Filter, Hash, Search, User, Users, X} from 'lucide-react';
import {Input} from '@/components/ui/input.tsx';
import {Button} from '@/components/ui/button.tsx';
import {Card, CardContent} from '@/components/ui/card.tsx';
import {Badge} from '@/components/ui/badge.tsx';
import {Skeleton} from '@/components/ui/skeleton.tsx';
import {motion} from 'framer-motion';
import type {Patient} from '@ai-scribe-oasis/shared/types.ts';
import {useNavigate} from 'react-router';
import {getJson} from '@/lib/api.ts';

export default function MainPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState('name');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        getJson<Patient[]>('/patients')
            .then(setPatients)
            .catch((error) => {
                console.error('Failed to fetch patients:', error);
                setPatients([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const visiblePatients = useMemo(() => {
        const term = search.toLowerCase();
        const filtered = patients.filter(
            (p) =>
                p.firstName.toLowerCase().includes(term) ||
                p.lastName.toLowerCase().includes(term) ||
                p.mrn.toLowerCase().includes(term),
        );
        return filtered.sort((a, b) => {
            if (sortKey === 'dob') {
                return new Date(a.dob).getTime() - new Date(b.dob).getTime();
            }
            return a.lastName.localeCompare(b.lastName);
        });
    }, [patients, search, sortKey]);

    const calculateAge = (dob: string) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <motion.main
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    className="p-6 min-h-screen gap-6 max-w-6xl mx-auto flex flex-col"
                >
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-64"/>
                        <div className="flex flex-col md:flex-row items-stretch gap-4">
                            <Skeleton className="h-10 flex-1"/>
                            <Skeleton className="h-10 w-40"/>
                            <Skeleton className="h-10 w-20"/>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {Array.from({length: 5}).map((_, i) => (
                            <Card key={i}>
                                <CardContent className="flex gap-4 items-center">
                                    <Skeleton className="w-12 h-12 rounded-full"/>
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-48"/>
                                        <Skeleton className="h-4 w-32"/>
                                    </div>
                                    <Skeleton className="h-9 w-16"/>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <motion.main
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
                className="p-6 min-h-screen gap-6 max-w-6xl mx-auto flex flex-col"
            >
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.1}}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white"/>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Patient Directory</h1>
                            <p className="text-gray-600">OASIS Assessment System</p>
                        </div>
                        <div className="flex-1"/>
                        <Badge variant="secondary" className="text-sm">
                            {patients.length} {patients.length === 1 ? 'Patient' : 'Patients'}
                        </Badge>
                    </div>

                    <div
                        className="flex flex-col md:flex-row items-stretch gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
                            <Input
                                placeholder="Search by name or MRN…"
                                className="pl-10 border-blue-200 focus:border-blue-400 bg-white/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500"/>
                            <Select value={sortKey} onValueChange={setSortKey}>
                                <SelectTrigger className="w-40 border-blue-200 bg-white/50">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Sort by Name</SelectItem>
                                    <SelectItem value="dob">Sort by Age</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {search && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSearch('')}
                                className="border-blue-200 hover:bg-blue-50"
                            >
                                <X className="w-4 h-4 mr-1"/>
                                Clear
                            </Button>
                        )}
                    </div>
                </motion.div>

                <div className="space-y-4 flex-1">
                    {visiblePatients.map((patient, index) => (
                        <motion.div
                            key={patient.id}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.1 * index}}
                        >
                            <Card
                                className="hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm group">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="w-6 h-6 text-white"/>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg text-gray-800 truncate">
                                                    {patient.firstName} {patient.lastName}
                                                </h3>
                                                <Badge variant="outline" className="text-xs">
                                                    Age {calculateAge(patient.dob)}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Hash className="w-3 h-3"/>
                                                    <span className="font-mono">{patient.mrn}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3"/>
                                                    <span>{new Date(patient.dob).toLocaleDateString()}</span>
                                                </div>
                                                {patient.phone && (
                                                    <div className="hidden sm:flex items-center gap-1">
                                                        <span>📞</span>
                                                        <span>{patient.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => navigate(`/patient/${patient.id}`)}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md group-hover:shadow-lg transition-all duration-200"
                                        >
                                            View Patient
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}

                    {!visiblePatients.length && !loading && (
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            transition={{delay: 0.3}}
                            className="text-center py-16"
                        >
                            <div
                                className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400"/>
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">No patients found</h3>
                            <p className="text-gray-500">
                                {search ? 'Try adjusting your search terms' : 'No patients have been added yet'}
                            </p>
                            {search && (
                                <Button variant="outline" onClick={() => setSearch('')} className="mt-4">
                                    Clear search
                                </Button>
                            )}
                        </motion.div>
                    )}
                </div>

                {visiblePatients.length > 0 && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 0.4}}
                        className="text-center text-sm text-gray-500 py-4"
                    >
                        Showing {visiblePatients.length} of {patients.length} patients
                    </motion.div>
                )}
            </motion.main>
        </div>
    );
}
