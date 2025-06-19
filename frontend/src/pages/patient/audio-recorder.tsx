'use client';

import { z } from 'zod';
import type { Note, Patient } from '@ai-scribe-oasis/shared/types.ts';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postFormData } from '@/lib/api.ts';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.tsx';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form.tsx';
import { ChevronDown, ChevronUp, CircleStop, Mic, Pause, Play, Upload, X } from 'lucide-react';
import { ALLOWED_AUDIO_MIME_TYPES, MAX_AUDIO_FILE_SIZE } from '@ai-scribe-oasis/shared/constants.ts';
import { cn } from '@/lib/utils';
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
    FileUploadTrigger,
} from '@/components/ui/file-upload.tsx';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Separator } from '@/components/ui/separator.tsx';

const uploadFormSchema = z.object({
    audio: z
        .instanceof(File, { message: 'Audio file is required' })
        .refine((file) => file.size < MAX_AUDIO_FILE_SIZE, {
            message: 'File too large',
        })
        .refine((f) => ALLOWED_AUDIO_MIME_TYPES.includes(f.type as any), { message: 'File type not supported' }),
});

interface AudioRecorderProps {
    patient: Patient;
    currentNote?: Note;
    mode: 'new' | 'add';
    onSuccess?: () => void;
}

export function AudioRecorder({
                                  patient,
                                  currentNote,
                                  mode,
                                  onSuccess,
                              }: AudioRecorderProps) {
    const [uploading, setUploading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [file, setFile] = useState(false);

    const form = useForm<z.infer<typeof uploadFormSchema>>({
        resolver: zodResolver(uploadFormSchema),
    });

    const recorderControls = useVoiceVisualizer();
    const {
        recordedBlob,
        error,
        recordingTime,
        formattedRecordingTime,
        formattedDuration,
        isRecordingInProgress,
        isPausedRecording,
        startRecording,
        stopRecording,
        togglePauseResume,
        clearCanvas,
        setPreloadedAudioBlob,
        startAudioPlayback,
        stopAudioPlayback,
        isPausedRecordedAudio,
    } = recorderControls;

    // Convert recorded blob to file when recording stops
    useEffect(() => {
        if (recordedBlob && !isRecordingInProgress && !file) {
            console.log('Recorded Blob:', recordedBlob);
            convertWebmToMp3(recordedBlob).then((mp3Blob) => {
                console.log('Converted MP3 Blob:', mp3Blob);
                const file = new File([mp3Blob], `recording-${Date.now()}.mp3`, { type: 'audio/mp3' });
                form.setValue('audio', file);
                form.clearErrors('audio');
            });
        }
    }, [recordedBlob, isRecordingInProgress, form]);

    // Handle errors
    useEffect(() => {
        if (error) {
            toast.error('Recording error', { description: error.message });
        }
    }, [error]);

    const handleStartRecording = () => {
        startRecording();
        setFile(false);
    };

    const handleStopRecording = () => {
        stopRecording();
        setIsExpanded(true);
    };

    const handlePauseResume = () => {
        togglePauseResume();
    };

    const onSubmit = async (data: z.infer<typeof uploadFormSchema>) => {
        const formData = new FormData();
        formData.append('audio', data.audio);
        formData.append('patientId', patient.id.toString());

        if (mode === 'add' && currentNote) {
            formData.append('noteId', currentNote.id.toString());
        }

        setUploading(true);
        try {
            const endpoint = mode === 'add' ? `/notes/${currentNote?.id}/audio` : '/notes/audio';
            await postFormData(endpoint, formData);
            toast.success(mode === 'add' ? 'Audio added successfully' : 'Note created successfully');
            resetRecording();
            setIsExpanded(false);
            onSuccess?.();
        } catch (err) {
            toast.error('Upload failed', { description: String(err) });
        } finally {
            setUploading(false);
        }
    };

    const resetRecording = () => {
        form.reset();
        clearCanvas();
    };

    // Compact collapsible view for header
    return (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <div className="relative">
                <div className="flex items-center gap-2">
                    {/* Only show record button if not finished recording */}
                    {(!recordedBlob || isRecordingInProgress) && (
                        <Button
                            onClick={isRecordingInProgress ? handleStopRecording : handleStartRecording}
                            disabled={uploading}
                            size="sm"
                            className={cn(
                                'h-8 w-8 rounded-full p-0 transition-all duration-200 shadow-sm',
                                isRecordingInProgress
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-white/80 hover:bg-white border border-blue-200 text-blue-600 hover:text-blue-700',
                                isRecordingInProgress && !isPausedRecording && 'animate-pulse',
                            )}
                        >
                            {isRecordingInProgress ? <CircleStop className="w-3 h-3 text-white" /> :
                                <Mic className="w-3 h-3" />}
                        </Button>
                    )}

                    {isRecordingInProgress && (
                        <Button
                            onClick={handlePauseResume}
                            size="sm"
                            className="h-8 w-8 rounded-full p-0 bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                        >
                            {isPausedRecording ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                        </Button>
                    )}

                    {recordedBlob && !isRecordingInProgress && (
                        <Button
                            onClick={resetRecording}
                            size="sm"
                            className="h-8 w-8 rounded-full p-0 bg-red-500 hover:bg-red-600  text-white shadow-sm"
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    )}

                    {(isRecordingInProgress || recordingTime > 0) && (
                        <span className="font-mono text-gray-700 min-w-[2.5rem]">{formattedRecordingTime}</span>
                    )}
                    {recordedBlob && !isRecordingInProgress && (
                        <span className="font-mono text-blue-600 hover:text-blue-700">{formattedDuration}</span>
                    )}

                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-white/50"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </Button>
                    </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="absolute top-full right-0 mt-2 z-50">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-4 w-80">
                        <div className="space-y-4">

                            <div className="flex flex-row items-center gap-2">
                                {recordedBlob && (
                                    <Button
                                        onClick={() => {
                                            if (isPausedRecordedAudio) {
                                                startAudioPlayback();
                                            } else {
                                                stopAudioPlayback();
                                            }
                                        }}
                                        size="sm"
                                        className="h-8 w-8 rounded-full p-0 text-white shadow-sm bg-blue-500 hover:bg-blue-600"
                                    >
                                        {isPausedRecordedAudio ? <Play className="w-3 h-3" /> :
                                            <Pause className="w-3 h-3" />}
                                    </Button>
                                )}
                                <div className="w-full h-12 bg-gray-50 rounded-lg p-2">
                                    <VoiceVisualizer
                                        controls={recorderControls}
                                        height={32}
                                        width="90%"
                                        barWidth={2}
                                        gap={1}
                                        rounded={3}
                                        isControlPanelShown={false}
                                        isDownloadAudioButtonShown={false}
                                        isAudioProcessingTextShown={false}
                                        mainBarColor={isPausedRecording ? '#f97316' : isRecordingInProgress ? '#ef4444' : '#3b82f6'}
                                        secondaryBarColor={isPausedRecording ? '#fb923c' : isRecordingInProgress ? '#f87171' : '#60a5fa'}
                                    />
                                </div>
                            </div>


                            {!recordedBlob && !isRecordingInProgress && (
                                <>
                                    <div className="flex items-center gap-4 mt-2 mb-4">
                                        <Separator className="flex-1" />
                                        <span className="text-muted-foreground">or</span>
                                        <Separator className="flex-1" />
                                    </div>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                                            <FormField
                                                control={form.control}
                                                name="audio"
                                                render={({ field: { value, onChange } }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <FileUpload
                                                                className="w-full"
                                                                value={value ? [value] : []}
                                                                onValueChange={(files) => {
                                                                    if (files && files.length > 0) {
                                                                        onChange(files[0]);
                                                                        setFile(true);
                                                                        setPreloadedAudioBlob(files[0]);
                                                                    }
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
                                                                                    className="bg-blue-50 border-blue-200 max-w-md">
                                                                        <FileUploadItemPreview />
                                                                        <FileUploadItemMetadata />
                                                                        <FileUploadItemDelete asChild>
                                                                            <Button variant="ghost" size="icon"
                                                                                    className="size-7 hover:bg-red-100">
                                                                                <X className="w-4 h-4" />
                                                                            </Button>
                                                                        </FileUploadItemDelete>
                                                                    </FileUploadItem>
                                                                ) : (
                                                                    <FileUploadDropzone
                                                                        className="border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                                                                        <div
                                                                            className="flex flex-col items-center gap-2 text-center py-3">
                                                                            <Upload className="w-5 h-5 text-blue-600" />
                                                                            <div>
                                                                                <p className="font-medium text-xs text-gray-800">Drop
                                                                                    audio file</p>
                                                                                <p className="text-gray-500 text-xs">MP3,
                                                                                    WAV, M4A</p>
                                                                            </div>
                                                                            <FileUploadTrigger asChild>
                                                                                <Button variant="outline" size="sm"
                                                                                        className="text-xs">
                                                                                    Choose File
                                                                                </Button>
                                                                            </FileUploadTrigger>
                                                                        </div>
                                                                    </FileUploadDropzone>
                                                                )}
                                                            </FileUpload>
                                                        </FormControl>
                                                        <FormMessage />

                                                    </FormItem>
                                                )}
                                            />
                                        </form>
                                    </Form>
                                </>
                            )}

                            {(recordedBlob || form.getValues().audio) && (
                                <Button
                                    onClick={form.handleSubmit(onSubmit)}
                                    loading={uploading}
                                    disabled={(!form.getValues().audio && !recordedBlob) || isRecordingInProgress}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    size="sm"
                                >
                                    {uploading ? 'Uploading...' : mode === 'add' ? 'Add Audio to Note' : 'Create Note'}
                                </Button>
                            )}
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}

async function convertWebmToMp3(webmBlob: Blob): Promise<Blob> {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    const inputName = 'input.webm';
    const outputName = 'output.mp3';

    await ffmpeg.writeFile(inputName, await fetchFile(webmBlob));
    await ffmpeg.exec([
        '-i', inputName,
        '-vn',
        '-ar', '44100',
        '-ac', '2',
        '-b:a', '192k',
        outputName,
    ]);

    const data = await ffmpeg.readFile(outputName);
    return new Blob([data], { type: 'audio/mp3' });
}
