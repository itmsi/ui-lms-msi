import { Activity, BookOpen, ExternalLink, FileText, Route } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { ActivityKind } from '@/types/activity';
import { cn } from '@/utils/cn';

const ICON_BY_KIND: Record<ActivityKind, LucideIcon> = {
    track: Route,
    module: BookOpen,
    lesson: FileText,
    link: ExternalLink,
    other: Activity,
};

const TONE_BY_KIND: Record<ActivityKind, string> = {
    track: 'bg-primary text-white',
    module: 'bg-primary-light text-primary-dark',
    lesson: 'bg-surface text-primary border-primary/40 border',
    link: 'bg-neutral-soft text-neutral-ink',
    other: 'bg-neutral-soft text-neutral-ink',
};

interface ActivityKindIconProps {
    kind: ActivityKind;
    className?: string;
}

export const ActivityKindIcon = ({ kind, className }: ActivityKindIconProps) => {
    const Icon = ICON_BY_KIND[kind];

    return (
        <span
            aria-hidden="true"
            className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', TONE_BY_KIND[kind], className)}
        >
            <Icon className="size-4" />
        </span>
    );
};
