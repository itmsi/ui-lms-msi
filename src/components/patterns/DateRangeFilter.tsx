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

const describeDraft = (draft: DayRange | undefined): string => {
    if (draft?.from === undefined) {
        return strings.dateRange.pickStart;
    }

    if (draft.to === undefined) {
        return `${formatShortDate(draft.from)} – ${strings.dateRange.pickEnd}`;
    }

    return `${formatDateSpan(draft.from, draft.to)} · ${String(countDaysInclusive(draft.from, draft.to))} ${strings.dateRange.daysSuffix}`;
};

const toDayRange = (range: DateRange): DayRange => ({ from: fromIsoDate(range.start), to: fromIsoDate(range.end) });

interface DateRangeFilterProps<P extends string> {
    presets?: SegmentedOption<P>[];
    resolvePreset?: (preset: P) => DateRange;
    preset: P | typeof CUSTOM;
    range: DateRange;
    max: string;
    onSelectPreset: (preset: P) => void;
    onChangeRange: (range: DateRange) => void;
    disabled?: boolean;
}

export const DateRangeFilter = <P extends string>({
    presets,
    resolvePreset,
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
    const [draftPreset, setDraftPreset] = useState<P | typeof CUSTOM>(preset);

    const latest = fromIsoDate(max) ?? new Date();
    const applied = toDayRange(range);
    const spanLabel = applied.from === undefined || applied.to === undefined ? '' : formatDateSpan(applied.from, applied.to);
    const appliedLabel = spanLabel;

    const openDialog = () => {
        setDraft(toDayRange(range));
        setDraftPreset(preset);
        setOpen(true);
        dialogRef.current?.showModal();
    };

    const closeDialog = () => {
        dialogRef.current?.close();
    };

    const choosePreset = (value: P | typeof CUSTOM) => {
        if (value === CUSTOM || resolvePreset === undefined) {
            return;
        }

        setDraftPreset(value);
        setDraft(toDayRange(resolvePreset(value)));
    };

    const chooseDays = (next: DayRange | undefined) => {
        setDraft(next);
        setDraftPreset(CUSTOM);
    };

    const apply = () => {
        if (draftPreset !== CUSTOM) {
            onSelectPreset(draftPreset);
            closeDialog();
            return;
        }

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
        <div className={`flex items-center ${presets ? 'flex-wrap gap-2' : 'w-full'}`}>
            <button
                type="button"
                onClick={openDialog}
                disabled={disabled}
                aria-haspopup="dialog"
                aria-label={`${strings.dateRange.trigger}: ${appliedLabel}`}
                className='w-full text-body text-ink placeholder:text-muted bg-transparent inline-flex items-center justify-between gap-2 py-2 px-3 outline-none'
            >
                <CalendarRange aria-hidden="true" className="text-primary size-4" />
                <span className="tabular-nums">{appliedLabel}</span>
                <ChevronDown aria-hidden="true" className="text-muted size-4" />
            </button>
            {/* } */}



            <dialog
                ref={dialogRef}
                aria-labelledby={titleId}
                onClose={() => setOpen(false)}
                className={cn(
                    'bg-surface shadow-raised motion-rise max-h-[92dvh] overflow-y-auto border-0 p-0 backdrop:bg-black/40',
                    'mx-0 mt-auto mb-0 rounded-t-2xl',
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
                        {presets === undefined || resolvePreset === undefined ? null : (
                            <SegmentedControl<P | typeof CUSTOM>
                                label={strings.dateRange.label}
                                options={presets}
                                value={draftPreset}
                                onChange={choosePreset}
                                disabled={disabled}
                                showlabel={false}
                            />
                        )}

                        <div className="flex justify-center">
                            <RangeCalendar
                                selected={draft}
                                onSelect={chooseDays}
                                latest={latest}
                                numberOfMonths={isWide ? 2 : 1}
                            />
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
