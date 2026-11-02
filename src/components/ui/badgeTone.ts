export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
    neutral: 'bg-neutral-soft text-neutral-ink',
    primary: 'bg-primary-light text-primary-dark',
    success: 'bg-success-soft text-success-ink',
    warning: 'bg-warning-soft text-warning-ink',
    danger: 'bg-danger-soft text-danger-ink',
};
