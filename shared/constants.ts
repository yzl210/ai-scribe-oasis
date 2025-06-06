export const ALLOWED_AUDIO_MIME_TYPES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'audio/x-wave',
    'audio/mp4',
    'audio/x-m4a',
] as const;

export const MAX_AUDIO_FILE_SIZE = 25 * 1024 * 1024; // 25 MB