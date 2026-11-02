import type { SegmentedOption } from '@/components/ui/SegmentedControl';
import { strings } from '@/locales/id';
import type { DateRange } from '@/types/dateRange';
import { fromIsoDate, lastDaysRange } from '@/utils/dateTime';

export type RangePreset = '7d' | '30d' | '90d';

export type RangeSelectionPreset = RangePreset | 'custom';

export interface RangeSelection {
    preset: RangeSelectionPreset;
    range: DateRange;
}

export type RangeChange = { preset: RangePreset } | { preset: 'custom'; range: DateRange };

const RANGE_PARAM = 'range';
const FROM_PARAM = 'from';
const TO_PARAM = 'to';

const RANGE_PRESET_DAYS: Record<RangePreset, number> = { '7d': 7, '30d': 30, '90d': 90 };

export const DEFAULT_RANGE_PRESET: RangePreset = '7d';

export const RANGE_PRESET_OPTIONS: SegmentedOption<RangePreset>[] = [
    { value: '7d', label: strings.activityLog.rangePreset['7d'] },
    { value: '30d', label: strings.activityLog.rangePreset['30d'] },
    { value: '90d', label: strings.activityLog.rangePreset['90d'] },
];

export const isRangePreset = (value: string | null): value is RangePreset => value === '7d' || value === '30d' || value === '90d';

export const presetRange = (preset: RangePreset, today?: Date): DateRange => lastDaysRange(RANGE_PRESET_DAYS[preset], today);

export const readRangeParams = (params: URLSearchParams, todayIso: string): RangeSelection => {
    const preset = params.get(RANGE_PARAM);
    const from = params.get(FROM_PARAM);
    const to = params.get(TO_PARAM);

    if (preset === 'custom' && from !== null && to !== null) {
        const isValid = fromIsoDate(from) !== undefined && fromIsoDate(to) !== undefined && from <= to && to <= todayIso;

        if (isValid) {
            return { preset: 'custom', range: { start: from, end: to } };
        }
    }

    const resolved = isRangePreset(preset) ? preset : DEFAULT_RANGE_PRESET;

    return { preset: resolved, range: presetRange(resolved, fromIsoDate(todayIso)) };
};

export const writeRangeParams = (params: URLSearchParams, change: RangeChange) => {
    params.delete(FROM_PARAM);
    params.delete(TO_PARAM);

    if (change.preset === DEFAULT_RANGE_PRESET) {
        params.delete(RANGE_PARAM);
    } else {
        params.set(RANGE_PARAM, change.preset);
    }

    if (change.preset === 'custom') {
        params.set(FROM_PARAM, change.range.start);
        params.set(TO_PARAM, change.range.end);
    }
};
