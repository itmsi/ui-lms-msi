import type { DateRange as DayRange } from 'react-day-picker';

import { strings } from '@/locales/id';
import type { DateRange } from '@/types/dateRange';
import { countDaysInclusive, formatDateSpan, formatShortDate, fromIsoDate } from '@/utils/dateTime';

export const toDayRange = (range: DateRange): DayRange => ({ from: fromIsoDate(range.start), to: fromIsoDate(range.end) });

export const describeDayRange = (draft: DayRange | undefined): string => {
    if (draft?.from === undefined) {
        return strings.dateRange.pickStart;
    }

    if (draft.to === undefined) {
        return `${formatShortDate(draft.from)} – ${strings.dateRange.pickEnd}`;
    }

    return `${formatDateSpan(draft.from, draft.to)} · ${String(countDaysInclusive(draft.from, draft.to))} ${strings.dateRange.daysSuffix}`;
};

export const formatIsoRange = (range: DateRange): string => {
    const { from, to } = toDayRange(range);

    return from === undefined || to === undefined ? '' : formatDateSpan(from, to);
};
