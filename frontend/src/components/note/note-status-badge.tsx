import type React from 'react';
import type {Note} from '@ai-scribe-oasis/shared/types.ts';
import {Badge} from '@/components/ui/badge.tsx';
import {AlertCircle, CheckCircle2, Clock, Loader2} from 'lucide-react';
import {cn} from '@/lib/utils';

type StatusConfig = {
    label: string
    variant: 'default' | 'secondary' | 'outline' | 'destructive'
    icon: React.ElementType
    className: string
    pulseAnimation?: boolean
}

const STATUS_CONFIG: Record<Note['status'], StatusConfig> = {
    PENDING: {
        label: 'Pending',
        variant: 'outline',
        icon: Clock,
        className: 'bg-gray-50 text-gray-700 border-gray-300',
    },
    PROCESSING: {
        label: 'Processing',
        variant: 'secondary',
        icon: Loader2,
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        pulseAnimation: true,
    },
    READY: {
        label: 'Ready',
        variant: 'default',
        icon: CheckCircle2,
        className: 'bg-green-50 text-green-700 border-green-200',
    },
    ERROR: {
        label: 'Error',
        variant: 'destructive',
        icon: AlertCircle,
        className: 'bg-red-50 text-red-700 border-red-200',
    },
};

export function NoteStatusBadge({note, className}: { note: Note; className?: string }) {
    const config = STATUS_CONFIG[note.status] ?? {
        label: 'Unknown',
        variant: 'outline',
        icon: Clock,
        className: 'bg-gray-50 text-gray-700 border-gray-300',
    };

    const {label, icon: Icon, className: badgeClassName, pulseAnimation} = config;

    return (
        <Badge
            variant="outline"
            className={cn(
                'text-xs font-medium py-1 px-2.5 rounded-full border shadow-sm flex items-center gap-1.5 transition-all duration-200',
                badgeClassName,
                className,
            )}
        >
            <Icon
                className={cn('w-3.5 h-3.5', {
                    'animate-spin': pulseAnimation && note.status === 'PROCESSING',
                    'animate-pulse': pulseAnimation && note.status !== 'PROCESSING',
                })}
            />
            {label}
        </Badge>
    );
}
