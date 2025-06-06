import {z} from 'zod';
import type {Patient} from '@ai-scribe-oasis/shared/types.ts';
import {useEffect, useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {postFormData} from '@/lib/api.ts';
import {toast} from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog.tsx';
import {Button} from '@/components/ui/button.tsx';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form.tsx';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs.tsx';
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
    FileUploadTrigger,
} from '@/components/ui/file-upload.tsx';
import {CircleStop, Mic, PlusCircle, Upload, X} from 'lucide-react';
import {useReactMediaRecorder} from 'react-media-recorder';
import {ALLOWED_AUDIO_MIME_TYPES, MAX_AUDIO_FILE_SIZE} from '@ai-scribe-oasis/shared/constants.ts';

const uploadFormSchema = z.object({
    audio: z
        .instanceof(File, {message: 'Audio file is required'})
        .refine((file) => file.size < MAX_AUDIO_FILE_SIZE, {
            message: 'File too large',
        })
        .refine(
            (f) => ALLOWED_AUDIO_MIME_TYPES.includes(f.type as any),
            {message: 'File type not supported'}
        ),
});

export function NewNote({patient}: { patient: Patient }) {
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mode, setMode] = useState<'upload' | 'record'>('upload');
    const [recordingTime, setRecordingTime] = useState(0);
    const intervalRef = useRef<number>();

    const form = useForm<z.infer<typeof uploadFormSchema>>({
        resolver: zodResolver(uploadFormSchema),
    });

    const clearTimer = () => {
        if (intervalRef.current !== undefined) {
            clearInterval(intervalRef.current);
            intervalRef.current = undefined;
        }
    };

    const {
        status,
        startRecording,
        stopRecording,
        mediaBlobUrl,
        clearBlobUrl,
    } = useReactMediaRecorder({
        audio: true,
        onStop: (_blobUrl, blob) => {
            const file = new File([blob], `recording-${Date.now()}.wav`, {type: 'audio/wav'});
            form.setValue('audio', file);
            form.clearErrors('audio');
            clearTimer();
        },
    });

    const isRecording = status === 'recording';

    const handleStartRecording = () => {
        setRecordingTime(0);
        startRecording();

        intervalRef.current = window.setInterval(() => {
            setRecordingTime((t) => t + 1);
        }, 1000);
    };

    const handleStopRecording = () => {
        stopRecording();
    };

    const onSubmit = async (data: z.infer<typeof uploadFormSchema>) => {
        const formData = new FormData();
        formData.append('audio', data.audio);
        formData.append('patientId', patient.id.toString());
        setUploading(true);
        try {
            await postFormData('/notes', formData);
            toast.success('Note uploaded successfully');
            setOpen(false);
        } catch (err) {
            toast.error('Upload failed', {description: String(err)});
        } finally {
            setUploading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (!open) {
            form.reset();
            clearBlobUrl();
            setRecordingTime(0);
            setMode('upload');
            clearTimer();
            if (status === 'recording') {
                handleStopRecording();
            }
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                    <PlusCircle className="w-4 h-4 mr-2"/>
                    New Note
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                                New Note For {patient.firstName} {patient.lastName}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="py-4">
                            <Tabs value={mode} onValueChange={(value) => setMode(value as 'upload' | 'record')}>
                                <TabsList className="grid grid-cols-2 mb-4">
                                    <TabsTrigger value="upload">Upload Audio</TabsTrigger>
                                    <TabsTrigger value="record">Record Audio</TabsTrigger>
                                </TabsList>

                                <TabsContent value="upload" className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="audio"
                                        render={({field: {value, onChange}}) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-base font-medium">Audio File</FormLabel>
                                                <FormControl>
                                                    <FileUpload
                                                        className="w-full"
                                                        value={value ? [value] : []}
                                                        onValueChange={(files) => {
                                                            clearBlobUrl();
                                                            onChange(files && files[0]);
                                                        }}
                                                        accept={ALLOWED_AUDIO_MIME_TYPES.join(',')}
                                                        maxSize={MAX_AUDIO_FILE_SIZE}
                                                        onFileAccept={(_) => {
                                                            form.clearErrors('audio');
                                                        }}
                                                        onFileReject={(_, message) => {
                                                            form.setError('audio', {
                                                                message,
                                                            });
                                                        }}
                                                    >
                                                        {value ? (
                                                            <FileUploadItem value={value}
                                                                            className="bg-blue-50 border-blue-200">
                                                                <FileUploadItemPreview/>
                                                                <FileUploadItemMetadata/>
                                                                <FileUploadItemDelete asChild>
                                                                    <Button variant="ghost" size="icon"
                                                                            className="size-7 hover:bg-red-100">
                                                                        <X className="w-4 h-4"/>
                                                                    </Button>
                                                                </FileUploadItemDelete>
                                                            </FileUploadItem>
                                                        ) : (
                                                            <FileUploadDropzone
                                                                className="border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                                                                <div
                                                                    className="flex flex-col items-center gap-3 text-center py-8">
                                                                    <div
                                                                        className="flex items-center justify-center rounded-full border-2 border-blue-300 p-4 bg-white">
                                                                        <Upload className="size-8 text-blue-600"/>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-base text-gray-800">Drag
                                                                            & drop audio file here</p>
                                                                        <p className="text-gray-500 text-sm mt-1">Supports
                                                                            MP3, WAV, M4A • up to 25MB</p>
                                                                    </div>
                                                                    <FileUploadTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            className="mt-2 bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                                                                        >
                                                                            Choose File
                                                                        </Button>
                                                                    </FileUploadTrigger>
                                                                </div>
                                                            </FileUploadDropzone>
                                                        )}
                                                    </FileUpload>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>

                                <TabsContent value="record" className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                        <div className="flex flex-col items-center gap-4">
                                            {!mediaBlobUrl ? (
                                                <>
                                                    <div
                                                        className="w-16 h-16 rounded-full bg-white border-2 border-blue-300 flex items-center justify-center">
                                                        {isRecording ? (
                                                            <div
                                                                className="w-6 h-6 rounded-full bg-red-500 animate-pulse"/>
                                                        ) : (
                                                            <Mic className="w-8 h-8 text-blue-600"/>
                                                        )}
                                                    </div>

                                                    {isRecording ? (
                                                        <div className="text-center">
                                                            <div
                                                                className="text-2xl font-mono font-bold text-gray-800 mb-2">
                                                                {formatTime(recordingTime)}
                                                            </div>
                                                            <p className="text-red-500 text-sm mb-4">Recording...</p>
                                                            <Button type="button" variant="destructive"
                                                                    onClick={handleStopRecording} className="px-6">
                                                                <CircleStop className="w-4 h-4 mr-2"/>
                                                                Stop Recording
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <Button
                                                                type="button"
                                                                onClick={handleStartRecording}
                                                                className="bg-blue-600 hover:bg-blue-700 px-6"
                                                            >
                                                                <Mic className="w-4 h-4 mr-2"/>
                                                                Start Recording
                                                            </Button>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="w-full">
                                                    <div className="mb-4 text-center">
                                                        <div
                                                            className="text-lg font-medium text-gray-800 mb-2">Recording
                                                            Complete
                                                        </div>
                                                    </div>

                                                    <audio controls className="w-full mb-4">
                                                        <source src={mediaBlobUrl} type="audio/wav"/>
                                                    </audio>

                                                    <div className="flex justify-center gap-3">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                clearBlobUrl();
                                                                setRecordingTime(0);
                                                                form.resetField('audio');
                                                            }}
                                                        >
                                                            Record Again
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        <DialogFooter>
                            <Button
                                type="submit"
                                loading={uploading}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                Upload Audio
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
