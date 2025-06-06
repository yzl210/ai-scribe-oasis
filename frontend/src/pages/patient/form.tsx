import {useState} from 'react';
import {Button} from '@/components/ui/button.tsx';
import {ArrowDownToLine, ArrowUpToLine} from 'lucide-react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select.tsx';

type Key = string;

export function useAccordion(keys: Key[]) {
    const [open, setOpen] = useState<Key[]>([]);
    return {
        open,
        setOpen,
        openAll: () => setOpen(keys),
        closeAll: () => setOpen([]),
    } as const;
}

interface ArrowTogglesProps {
    onExpand: () => void;
    onCollapse: () => void;
}

export function ArrowToggles({onExpand, onCollapse}: ArrowTogglesProps) {
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

interface ScoreSelectProps {
    value: string | null;
    codes: Record<string, string>;
    placeholder?: string;
    onChange: (v: string | null) => void;
}

export function ScoreSelect({
                                value,
                                codes,
                                placeholder = 'Select…',
                                onChange,
                            }: ScoreSelectProps) {
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