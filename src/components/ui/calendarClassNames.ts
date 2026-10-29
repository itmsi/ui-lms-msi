import type { ClassNames } from 'react-day-picker';

export const CALENDAR_CLASS_NAMES: Partial<ClassNames> = {
    root: 'relative w-fit',
    months: 'relative flex flex-col gap-6 sm:flex-row',
    month: 'flex flex-col gap-2',
    month_caption: 'flex h-10 items-center justify-center px-10',
    caption_label: 'font-display text-body text-ink inline-flex items-center gap-1 font-semibold capitalize',
    dropdowns: 'flex items-center gap-1.5',
    dropdown_root:
        'border-line bg-surface hover:border-primary focus-within:outline-primary relative inline-flex h-9 items-center rounded-lg border px-2.5 transition-colors focus-within:outline-2',
    dropdown: 'absolute inset-0 z-1 w-full cursor-pointer appearance-none opacity-0',
    nav: 'pointer-events-none absolute inset-x-0 top-0 z-2 flex h-10 items-center justify-between',
    button_previous:
        'text-primary hover:bg-primary-light focus-visible:outline-primary pointer-events-auto inline-flex size-9 items-center justify-center rounded-full transition-colors focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-30 aria-disabled:cursor-not-allowed aria-disabled:opacity-30',
    button_next:
        'text-primary hover:bg-primary-light focus-visible:outline-primary pointer-events-auto inline-flex size-9 items-center justify-center rounded-full transition-colors focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-30 aria-disabled:cursor-not-allowed aria-disabled:opacity-30',
    chevron: 'size-4',
    month_grid: 'border-separate border-spacing-x-0 border-spacing-y-1',
    weekday: 'text-caption text-muted h-8 w-10 text-center font-medium capitalize',
    day: 'text-body size-10 p-0 text-center',
    day_button:
        'text-ink hover:bg-primary-light focus-visible:outline-primary inline-flex size-10 items-center justify-center rounded-full tabular-nums transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 disabled:cursor-not-allowed disabled:hover:bg-transparent',
    today: 'font-semibold [&>button]:ring-primary/50 [&>button]:ring-1 [&>button]:ring-inset',
    outside: 'opacity-40',
    disabled: '[&>button]:text-muted/50',
    hidden: 'invisible',
    range_start: 'bg-primary-light rounded-l-full [&>button]:bg-primary [&>button]:text-white [&>button]:hover:bg-primary-dark',
    range_end: 'bg-primary-light rounded-r-full [&>button]:bg-primary [&>button]:text-white [&>button]:hover:bg-primary-dark',
    range_middle: 'bg-primary-light [&>button]:text-primary-dark [&>button]:rounded-none',
};
