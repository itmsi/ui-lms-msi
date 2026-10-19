import { strings } from '@/locales/id';
import type { DateRange } from '@/types/dateRange';

const LOCALE = 'id-ID';
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const relativeFormat = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
const timeFormat = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });
const dayFormat = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fullFormat = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'long', timeStyle: 'short' });

const toDate = (iso: string): Date | null => {
    const date = new Date(iso);

    return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (time: number): number => {
    const date = new Date(time);
    date.setHours(0, 0, 0, 0);

    return date.getTime();
};

export const toDayKey = (iso: string): string => {
    const date = toDate(iso);

    return date === null ? '' : String(startOfDay(date.getTime()));
};

export const formatDayLabel = (iso: string, now: number): string => {
    const date = toDate(iso);

    if (date === null) {
        return '';
    }

    const daysAgo = Math.round((startOfDay(now) - startOfDay(date.getTime())) / DAY);

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

    const elapsed = now - date.getTime();

    if (elapsed < MINUTE) {
        return strings.activityLog.justNow;
    }

    if (elapsed < HOUR) {
        return relativeFormat.format(-Math.floor(elapsed / MINUTE), 'minute');
    }

    if (elapsed < DAY) {
        return relativeFormat.format(-Math.floor(elapsed / HOUR), 'hour');
    }

    return elapsed < 2 * DAY ? relativeFormat.format(-1, 'day') : fullFormat.format(date);
};

export const formatClock = (iso: string): string => {
    const date = toDate(iso);

    return date === null ? '' : timeFormat.format(date);
};

const pad = (value: number): string => String(value).padStart(2, '0');

export const toIsoDate = (date: Date): string =>
    `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const lastDaysRange = (days: number, today: Date = new Date()): DateRange => {
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));

    return { start: toIsoDate(start), end: toIsoDate(today) };
};

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const fromIsoDate = (isoDate: string): Date | undefined => {
    const match = ISO_DATE.exec(isoDate);

    return match === null ? undefined : new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

const shortDateFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
const dayMonthFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });

export const formatShortDate = (date: Date): string => shortDateFormat.format(date);

export const formatIsoDate = (isoDate: string): string => {
    const date = fromIsoDate(isoDate);

    return date === undefined ? isoDate : shortDateFormat.format(date);
};

export const formatDateSpan = (start: Date, end: Date): string =>
    start.getFullYear() === end.getFullYear()
        ? `${dayMonthFormat.format(start)} – ${shortDateFormat.format(end)}`
        : `${shortDateFormat.format(start)} – ${shortDateFormat.format(end)}`;

export const countDaysInclusive = (start: Date, end: Date): number =>
    Math.round((startOfDay(end.getTime()) - startOfDay(start.getTime())) / DAY) + 1;

export const formatFullDateTime = (iso: string): string => {
    const date = toDate(iso);

    return date === null ? '' : fullFormat.format(date);
};
