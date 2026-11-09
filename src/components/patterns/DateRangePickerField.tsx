import { CalendarRange, ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { RangeCalendar } from '@/components/ui/RangeCalendar';
import type { DayRange } from '@/components/ui/RangeCalendar';
import { SheetDialog } from '@/components/ui/SheetDialog';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { strings } from '@/locales/id';
import type { DateRange } from '@/types/dateRange';
import { cn } from '@/utils/cn';
import { describeDayRange, formatIsoRange, toDayRange } from '@/utils/dateRangeText';
import { fromIsoDate, toIsoDate } from '@/utils/dateTime';

interface DateRangePickerFieldProps {
    label: string;
    value: DateRange | null;
    onChange: (value: DateRange | null) => void;
    placeholder?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    min?: string;
    max?: string;
    disabled?: boolean;
    className?: string;
}

export const DateRangePickerField = ({
    label,
    value,
    onChange,
    placeholder = strings.dateRange.placeholder,
    hint,
    error,
    required = false,
    min,
    max,
    disabled = false,
    className,
}: DateRangePickerFieldProps) => {
    const fieldId = useId();
    const titleId = `${fieldId}-title`;
    const hintId = `${fieldId}-hint`;
    const errorId = `${fieldId}-error`;
    const isWide = useMediaQuery('(min-width: 640px)');
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<DayRange | undefined>(undefined);

    const display = value === null ? placeholder : formatIsoRange(value);
    const describedBy = [hint === undefined ? null : hintId, error === undefined ? null : errorId]
        .filter((part): part is string => part !== null)
        .join(' ');

    const openDialog = () => {
        setDraft(value === null ? undefined : toDayRange(value));
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
    };

    const apply = () => {
        if (draft?.from === undefined) {
            return;
        }

        onChange({ start: toIsoDate(draft.from), end: toIsoDate(draft.to ?? draft.from) });
        closeDialog();
    };

    const clear = () => {
        onChange(null);
        closeDialog();
    };

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label htmlFor={fieldId} className="text-body text-ink font-medium">
                {label}
                {required ? (
                    <span aria-hidden="true" className="text-danger-ink">
                        {' '}
                        *
                    </span>
                ) : null}
            </label>

            <button
                id={fieldId}
                type="button"
                onClick={openDialog}
                disabled={disabled}
                aria-haspopup="dialog"
                aria-describedby={describedBy === '' ? undefined : describedBy}
                className={cn(
                    'bg-surface text-body flex h-12 w-full items-center gap-2.5 rounded-lg border px-3.5 text-left transition-colors',
                    'hover:border-primary focus-visible:outline-primary disabled:bg-neutral-soft focus-visible:outline-2 disabled:cursor-not-allowed',
                    error === undefined ? 'border-line' : 'border-danger',
                    value === null ? 'text-muted' : 'text-ink',
                )}
            >
                <CalendarRange aria-hidden="true" className="text-primary size-4.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate tabular-nums">{display}</span>
                <ChevronDown aria-hidden="true" className="text-muted size-4 shrink-0" />
            </button>

            {hint === undefined ? null : (
                <p id={hintId} className="text-caption text-muted">
                    {hint}
                </p>
            )}
            {error === undefined ? null : (
                <p id={errorId} className="text-caption text-danger-ink">
                    {error}
                </p>
            )}

            <SheetDialog open={open} onClose={closeDialog} labelledBy={titleId}>
                <header className="flex flex-col gap-1">
                    <h2 id={titleId} className="text-card text-ink">
                        {label}
                    </h2>
                    <p aria-live="polite" className="text-body text-primary-dark tabular-nums">
                        {describeDayRange(draft)}
                    </p>
                </header>

                <div className="flex justify-center">
                    <RangeCalendar
                        selected={draft}
                        onSelect={setDraft}
                        earliest={min === undefined ? undefined : fromIsoDate(min)}
                        latest={max === undefined ? undefined : fromIsoDate(max)}
                        numberOfMonths={isWide ? 2 : 1}
                    />
                </div>

                <footer className="border-line flex flex-wrap items-center justify-end gap-2 border-t pt-4">
                    {value === null ? null : (
                        <Button variant="ghost" size="sm" onClick={clear} className="mr-auto">
                            {strings.dateRange.clear}
                        </Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={closeDialog}>
                        {strings.dateRange.cancel}
                    </Button>
                    <Button size="sm" onClick={apply} disabled={draft?.from === undefined}>
                        {strings.dateRange.apply}
                    </Button>
                </footer>
            </SheetDialog>
        </div>
    );
};
