import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
}

export const PageHeader = ({ title, description, actions, className }: PageHeaderProps) => (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
        <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-page">{title}</h1>
            {description === undefined ? null : <p className="text-body text-muted">{description}</p>}
        </div>
        {actions}
    </div>
);
