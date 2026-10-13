import { strings } from '@/locales/id';

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

    return elapsed < 7 * DAY ? relativeFormat.format(-Math.floor(elapsed / DAY), 'day') : fullFormat.format(date);
};

export const formatClock = (iso: string): string => {
    const date = toDate(iso);

    return date === null ? '' : timeFormat.format(date);
};

export const formatFullDateTime = (iso: string): string => {
    const date = toDate(iso);

    return date === null ? '' : fullFormat.format(date);
};
