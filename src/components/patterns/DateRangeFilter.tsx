import { CalendarRange, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { RangeCalendar } from '@/components/ui/RangeCalendar';
import type { DayRange } from '@/components/ui/RangeCalendar';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { SegmentedOption } from '@/components/ui/SegmentedControl';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { strings } from '@/locales/id';
import type { DateRange } from '@/types/dateRange';
import { cn } from '@/utils/cn';
import { countDaysInclusive, formatDateSpan, formatShortDate, fromIsoDate, toIsoDate } from '@/utils/dateTime';

const CUSTOM = 'custom';

const safeFormatShortDate = formatShortDate as (date: Date) => string;
const safeFormatDateSpan = formatDateSpan as (from: Date, to: Date) => string;
const safeCountDaysInclusive = countDaysInclusive as (from: Date, to: Date) => number;
const safeFromIsoDate = fromIsoDate as (value: string) => Date | undefined;

const describeDraft = (draft: DayRange | undefined): string => {
    if (draft?.from === undefined) {
        return String(strings.dateRange.pickStart);
    }

    if (draft.to === undefined) {
        return `${safeFormatShortDate(draft.from)} – ${strings.dateRange.pickEnd}`;
    }

    return `${safeFormatDateSpan(draft.from, draft.to)} · ${String(safeCountDaysInclusive(draft.from, draft.to))} ${strings.dateRange.daysSuffix}`;
};

const toDayRange = (range: DateRange): DayRange => ({ from: safeFromIsoDate(range.start), to: safeFromIsoDate(range.end) });

interface DateRangeFilterProps<P extends string> {
    presets: SegmentedOption<P>[];
    preset: P | typeof CUSTOM;
    range: DateRange;
    max: string;
    onSelectPreset: (preset: P) => void;
    onChangeRange: (range: DateRange) => void;
    disabled?: boolean;
}

export const DateRangeFilter = <P extends string>({
    presets,
    preset,
    range,
    max,
    onSelectPreset,
    onChangeRange,
    disabled = false,
}: DateRangeFilterProps<P>) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const isWide = useMediaQuery('(min-width: 640px)');
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<DayRange | undefined>(undefined);

    const latest = safeFromIsoDate(max) ?? new Date();
    const applied = toDayRange(range);
    const appliedLabel =
        applied.from === undefined || applied.to === undefined ? '' : safeFormatDateSpan(applied.from, applied.to);
    const isCustom = preset === CUSTOM;

    const openDialog = () => {
        setDraft(toDayRange(range));
        setOpen(true);
        dialogRef.current?.showModal();
    };

    const closeDialog = () => {
        dialogRef.current?.close();
    };

    const apply = () => {
        if (draft?.from === undefined) {
            return;
        }

        onChangeRange({ start: toIsoDate(draft.from), end: toIsoDate(draft.to ?? draft.from) });
        closeDialog();
    };

    useEffect(() => {
        const dialog = dialogRef.current;

        if (open === false || dialog === null) {
            return;
        }

        const handleBackdropClick = (event: MouseEvent) => {
            if (event.target === dialog) {
                dialog.close();
            }
        };

        dialog.addEventListener('click', handleBackdropClick);

        return () => {
            dialog.removeEventListener('click', handleBackdropClick);
        };
    }, [open]);

    return (
        <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl<P | typeof CUSTOM>
                label={strings.dateRange.label}
                options={presets}
                value={preset}
                onChange={(value) => {
                    if (value !== CUSTOM) {
                        onSelectPreset(value);
                    }
                }}
                disabled={disabled}
            />

            <button
                type="button"
                onClick={openDialog}
                disabled={disabled}
                aria-haspopup="dialog"
                aria-label={`${strings.dateRange.trigger}: ${appliedLabel}`}
                className={cn(
                    'text-caption inline-flex min-h-9 items-center gap-2 rounded-full border px-3 font-medium transition-colors',
                    'focus-visible:outline-primary focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-60',
                    isCustom
                        ? 'bg-primary-light border-primary text-primary-dark'
                        : 'bg-surface border-line text-ink hover:border-primary hover:text-primary-dark',
                )}
            >
                <CalendarRange aria-hidden="true" className="text-primary size-4" />
                <span className="tabular-nums">{appliedLabel}</span>
                <ChevronDown aria-hidden="true" className="text-muted size-4" />
            </button>

            <dialog
                ref={dialogRef}
                aria-labelledby={titleId}
                onClose={() => setOpen(false)}
                className={cn(
                    'bg-surface shadow-raised motion-rise max-h-[92dvh] overflow-y-auto border-0 p-0 backdrop:bg-black/40',
                    'mx-0 mt-auto mb-0 w-full max-w-2xl rounded-t-2xl',
                    'sm:m-auto sm:rounded-2xl',
                )}
            >
                {open ? (
                    <div className="flex flex-col gap-4 p-5">
                        <span aria-hidden="true" className="bg-line mx-auto h-1 w-10 rounded-full sm:hidden" />

                        <header className="flex flex-col gap-1">
                            <h2 id={titleId} className="text-card text-ink">
                                {strings.dateRange.title}
                            </h2>
                            <p aria-live="polite" className="text-body text-primary-dark tabular-nums">
                                {describeDraft(draft)}
                            </p>
                        </header>

                        <div className="flex justify-center">
                            <RangeCalendar selected={draft} onSelect={setDraft} latest={latest} numberOfMonths={isWide ? 2 : 1} />
                        </div>

                        <footer className="border-line flex justify-end gap-2 border-t pt-4">
                            <Button variant="secondary" size="sm" onClick={closeDialog}>
                                {strings.dateRange.cancel}
                            </Button>
                            <Button size="sm" onClick={apply} disabled={draft?.from === undefined}>
                                {strings.dateRange.apply}
                            </Button>
                        </footer>
                    </div>
                ) : null}
            </dialog>
        </div>
    );
};
