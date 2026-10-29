import { differenceInCalendarDays, differenceInHours, differenceInMinutes, format, isValid, parseISO, startOfDay, subDays } from 'date-fns';

import { strings } from '@/locales/id';
import type { DateRange } from '@/types/dateRange';

const LOCALE = 'id-ID';
const ISO_DATE_PATTERN = 'yyyy-MM-dd';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const relativeFormat = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
const timeFormat = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });
const dayFormat = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fullFormat = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'long', timeStyle: 'short' });
const shortDateFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
const dayMonthFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });

const toDate = (iso: string): Date | null => {
    const date = new Date(iso);

    return isValid(date) ? date : null;
};

export const toDayKey = (iso: string): string => {
    const date = toDate(iso);

    return date === null ? '' : String(startOfDay(date).getTime());
};

export const formatDayLabel = (iso: string, now: number): string => {
    const date = toDate(iso);

    if (date === null) {
        return '';
    }

    const daysAgo = differenceInCalendarDays(now, date);

    if (daysAgo === 0) {
        return strings.activityLog.today;
    }

    return daysAgo === 1 ? strings.activityLog.yesterday : dayFormat.format(date);
};

export const formatRelativeTime = (iso: string, now: number): string => {
    const date = toDate(iso);

    if (date === null) {
        return '';
    }

    const minutes = differenceInMinutes(now, date);

    if (minutes < 1) {
        return strings.activityLog.justNow;
    }

    if (minutes < 60) {
        return relativeFormat.format(-minutes, 'minute');
    }

    const hours = differenceInHours(now, date);

    if (hours < 24) {
        return relativeFormat.format(-hours, 'hour');
    }

    return hours < 48 ? relativeFormat.format(-1, 'day') : fullFormat.format(date);
};

export const formatClock = (iso: string): string => {
    const date = toDate(iso);

    return date === null ? '' : timeFormat.format(date);
};

export const toIsoDate = (date: Date): string => format(date, ISO_DATE_PATTERN);

export const lastDaysRange = (days: number, today: Date = new Date()): DateRange => ({
    start: toIsoDate(subDays(today, days - 1)),
    end: toIsoDate(today),
});

export const fromIsoDate = (isoDate: string): Date | undefined => {
    if (!ISO_DATE.test(isoDate)) {
        return undefined;
    }

    const date = parseISO(isoDate);

    return isValid(date) ? date : undefined;
};

export const formatShortDate = (date: Date): string => shortDateFormat.format(date);

export const formatDateSpan = (start: Date, end: Date): string =>
    start.getFullYear() === end.getFullYear()
        ? `${dayMonthFormat.format(start)} – ${shortDateFormat.format(end)}`
        : `${shortDateFormat.format(start)} – ${shortDateFormat.format(end)}`;

export const countDaysInclusive = (start: Date, end: Date): number => differenceInCalendarDays(end, start) + 1;

export const formatFullDateTime = (iso: string): string => {
    const date = toDate(iso);

    return date === null ? '' : fullFormat.format(date);
};
