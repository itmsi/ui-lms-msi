import type { SegmentedOption } from '@/components/ui/SegmentedControl';
import { strings } from '@/locales/id';
import type { DateRange } from '@/types/dateRange';
import { lastDaysRange } from '@/utils/dateTime';

export type RangePreset = '7d' | '30d' | '90d';

export type RangeSelectionPreset = RangePreset | 'custom';

const RANGE_PRESET_DAYS: Record<RangePreset, number> = { '7d': 7, '30d': 30, '90d': 90 };

export const DEFAULT_RANGE_PRESET: RangePreset = '7d';

export const RANGE_PRESET_OPTIONS: SegmentedOption<RangePreset>[] = [
    { value: '7d', label: strings.activityLog.rangePreset['7d'] },
    { value: '30d', label: strings.activityLog.rangePreset['30d'] },
    { value: '90d', label: strings.activityLog.rangePreset['90d'] },
];

export const isRangePreset = (value: string | null): value is RangePreset => value === '7d' || value === '30d' || value === '90d';

export const presetRange = (preset: RangePreset, today?: Date): DateRange => lastDaysRange(RANGE_PRESET_DAYS[preset], today);
