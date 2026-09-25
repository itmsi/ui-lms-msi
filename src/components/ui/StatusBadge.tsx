import { BookOpen, Check, CircleCheck, Clock, Hourglass, Lock, RefreshCw, TriangleAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { strings } from '@/locales/id';
import type { LearningStatus } from '@/types/common';
import { cn } from '@/utils/cn';

interface StatusBadgeProps {
    status: LearningStatus;
    className?: string;
}

const STATUS_STYLE: Record<LearningStatus, { icon: LucideIcon; className: string }> = {
    completed: { icon: Check, className: 'bg-success-soft text-success-ink' },
    approved: { icon: CircleCheck, className: 'bg-success-soft text-success-ink' },
    in_progress: { icon: BookOpen, className: 'bg-primary-light text-primary-dark' },
    under_review: { icon: Hourglass, className: 'bg-primary-light text-primary-dark' },
    not_started: { icon: Clock, className: 'bg-neutral-soft text-neutral-ink' },
    locked: { icon: Lock, className: 'bg-neutral-soft text-neutral-ink' },
    needs_revision: { icon: RefreshCw, className: 'bg-warning-soft text-warning-ink' },
    overdue: { icon: TriangleAlert, className: 'bg-danger-soft text-danger-ink' },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
    const { icon: Icon, className: toneClass } = STATUS_STYLE[status];

    return (
        <span
            className={cn(
                'text-caption inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium',
                toneClass,
                className,
            )}
        >
            <Icon aria-hidden="true" className="size-3.5 shrink-0" />
            {strings.status[status]}
        </span>
    );
};
