import * as React from 'react';
import { Label } from '@/components/ui/label';
import { TimePickerInput } from './time-picker-input';
import { TimePeriodSelect } from './period-select';
import { Period } from '@/lib/time-picker-utils';

interface TimePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    second?: boolean;
}

export function TimePicker12({ date, setDate, second }: TimePickerProps) {
    const [period, setPeriod] = React.useState<Period>(date ? (date.getHours() >= 12 ? 'PM' : 'AM') : 'AM');

    const minuteRef = React.useRef<HTMLInputElement>(null);
    const hourRef = React.useRef<HTMLInputElement>(null);
    const secondRef = React.useRef<HTMLInputElement>(null);
    const periodRef = React.useRef<HTMLButtonElement>(null);

    return (
        <div className="flex items-end gap-2 justify-center">
            <div className="grid gap-1 text-center">
                <Label htmlFor="hours" className="text-xs">
                    Hours
                </Label>
                <TimePickerInput
                    picker="12hours"
                    period={period}
                    date={date}
                    setDate={setDate}
                    ref={hourRef}
                    onRightFocus={() => minuteRef.current?.focus()}
                />
            </div>
            <div className="grid gap-1 text-center">
                <Label htmlFor="minutes" className="text-xs">
                    Minutes
                </Label>
                <TimePickerInput
                    picker="minutes"
                    id="minutes12"
                    date={date}
                    setDate={setDate}
                    ref={minuteRef}
                    onLeftFocus={() => hourRef.current?.focus()}
                    onRightFocus={() => secondRef.current?.focus()}
                />
            </div>
            {second && (
                <div className="grid gap-1 text-center">
                    <Label htmlFor="seconds" className="text-xs">
                        Seconds
                    </Label>
                    <TimePickerInput
                        picker="seconds"
                        id="seconds12"
                        date={date}
                        setDate={setDate}
                        ref={secondRef}
                        onLeftFocus={() => minuteRef.current?.focus()}
                        onRightFocus={() => periodRef.current?.focus()}
                    />
                </div>
            )}
            <div className="grid gap-1 text-center">
                <Label htmlFor="period" className="text-xs">
                    Period
                </Label>
                <TimePeriodSelect
                    period={period}
                    setPeriod={setPeriod}
                    date={date}
                    setDate={setDate}
                    ref={periodRef}
                    onLeftFocus={() => secondRef.current?.focus()}
                />
            </div>
        </div>
    );
}