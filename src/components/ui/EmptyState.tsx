import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { strings } from '@/locales/id';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
    icon?: LucideIcon;
    title?: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export const EmptyState = ({
    icon: Icon = Inbox,
    title = strings.states.emptyTitle,
    description,
    action,
    className,
}: EmptyStateProps) => (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-12 text-center', className)}>
        <span className="bg-neutral-soft text-neutral-ink flex size-12 items-center justify-center rounded-full">
            <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
            <p className="text-card text-ink">{title}</p>
            {description === undefined ? null : <p className="text-body text-muted max-w-md">{description}</p>}
        </div>
        {action}
    </div>
);
