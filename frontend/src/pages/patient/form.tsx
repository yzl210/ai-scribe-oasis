import {useState} from 'react';
import {Button, buttonVariants} from '@/components/ui/button.tsx';
import {ArrowDownToLine, ArrowUpToLine, CalendarIcon, ChevronDownIcon} from 'lucide-react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select.tsx';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover.tsx';
import {Calendar} from '@/components/ui/calendar.tsx';
import {cn} from '@/lib/utils.ts';
import {format} from 'date-fns';

export interface FormProps {
    initialData?: Object;
    setForm: (data: Object) => void;
}

export function useAccordion(keys: string[]) {
    const [open, setOpen] = useState<string[]>([]);
    return {
        open,
        setOpen,
        openAll: () => setOpen(keys),
        closeAll: () => setOpen([]),
    } as const;
}

export function ArrowToggles({onExpand, onCollapse}: {
    onExpand: () => void;
    onCollapse: () => void;
}) {
    return (
        <>
            <Button variant="outline" size="sm" onClick={onExpand} className="text-xs">
                <ArrowDownToLine className="w-3 h-3"/>
            </Button>
            <Button variant="outline" size="sm" onClick={onCollapse} className="text-xs">
                <ArrowUpToLine className="w-3 h-3"/>
            </Button>
        </>
    );
}


export function ScoreSelect({
                                value,
                                codes,
                                placeholder = 'Select…',
                                onChange,
                            }: {
    value: string | null;
    codes: Record<string, string>;
    placeholder?: string;
    onChange: (v: string | null) => void;
}) {
    return (
        <Select value={value ?? ''} onValueChange={(v) => onChange(v)}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder}/>
            </SelectTrigger>
            <SelectContent>
                {Object.entries(codes).map(([code, desc]) => (
                    <SelectItem key={code} value={code}>
                            <span className="truncate block">
                                {code}. {desc}
                            </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export function DateSelect(
    {date, setDate}: {
        date: Date | undefined
        setDate: (date: Date | undefined) => void
    }
) {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                className={cn(
                    buttonVariants({variant: 'outline'}),
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4"/>
                {date ? format(date, 'PPP') : 'Select date'}
                <ChevronDownIcon className="ml-auto h-4 w-4 opacity-25"/>
            </PopoverTrigger>
            <PopoverContent>
                <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                        setDate(date);
                        setOpen(false);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
