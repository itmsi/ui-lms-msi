import { CalendarRange, ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { RangeCalendar } from '@/components/ui/RangeCalendar';
import type { DayRange } from '@/components/ui/RangeCalendar';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { SegmentedOption } from '@/components/ui/SegmentedControl';
import { SheetDialog } from '@/components/ui/SheetDialog';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { strings } from '@/locales/id';
import type { DateRange } from '@/types/dateRange';
import { describeDayRange, formatIsoRange, toDayRange } from '@/utils/dateRangeText';
import { fromIsoDate, toIsoDate } from '@/utils/dateTime';

const CUSTOM = 'custom';

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
    const titleId = useId();
    const isWide = useMediaQuery('(min-width: 640px)');
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<DayRange | undefined>(undefined);
    const [draftPreset, setDraftPreset] = useState<P | typeof CUSTOM>(preset);

    const latest = fromIsoDate(max) ?? new Date();
    const appliedLabel = formatIsoRange(range);

    const openDialog = () => {
        setDraft(toDayRange(range));
        setDraftPreset(preset);
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
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

    return (
        <div className={`flex items-center ${presets ? 'flex-wrap gap-2 w-full' : 'w-full'}`}>
            <button
                type="button"
                onClick={openDialog}
                disabled={disabled}
                aria-haspopup="dialog"
                aria-label={`${strings.dateRange.trigger}: ${appliedLabel}`}
                className="w-full text-body text-ink placeholder:text-muted bg-transparent inline-flex items-center justify-between gap-2 py-2 px-3 outline-none"
            >
                <CalendarRange aria-hidden="true" className="text-primary size-4" />
                <span className="tabular-nums">{appliedLabel}</span>
                <ChevronDown aria-hidden="true" className="text-muted size-4" />
            </button>

            <SheetDialog open={open} onClose={closeDialog} labelledBy={titleId}>
                <header className="flex flex-col gap-1">
                    <h2 id={titleId} className="text-card text-ink">
                        {strings.dateRange.title}
                    </h2>
                    <p aria-live="polite" className="text-body text-primary-dark tabular-nums">
                        {describeDayRange(draft)}
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
                    <RangeCalendar selected={draft} onSelect={chooseDays} latest={latest} numberOfMonths={isWide ? 2 : 1} />
                </div>

                <footer className="border-line flex justify-end gap-2 border-t pt-4">
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
