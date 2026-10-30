import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

type BadgeSize = 'sm' | 'md';

const TONE_CLASS: Record<BadgeTone, string> = {
    neutral: 'bg-neutral-soft text-neutral-ink',
    primary: 'bg-primary-light text-primary-dark',
    success: 'bg-success-soft text-success-ink',
    warning: 'bg-warning-soft text-warning-ink',
    danger: 'bg-danger-soft text-danger-ink',
};

const SIZE_CLASS: Record<BadgeSize, { badge: string; icon: string }> = {
    sm: { badge: 'gap-1 px-2 py-0.5', icon: 'size-3' },
    md: { badge: 'gap-1.5 px-2.5 py-1', icon: 'size-3.5' },
};

interface BadgeProps {
    tone?: BadgeTone;
    size?: BadgeSize;
    icon?: LucideIcon;
    className?: string;
    children: ReactNode;
}

export const Badge = ({ tone = 'neutral', size = 'md', icon: Icon, className, children }: BadgeProps) => (
    <span
        className={cn(
            'text-caption inline-flex items-center rounded-full font-medium',
            TONE_CLASS[tone],
            SIZE_CLASS[size].badge,
            className,
        )}
    >
        {Icon === undefined ? null : <Icon aria-hidden="true" className={cn('shrink-0', SIZE_CLASS[size].icon)} />}
        {children}
    </span>
);
