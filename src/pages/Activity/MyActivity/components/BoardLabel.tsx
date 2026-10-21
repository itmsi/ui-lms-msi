import type { ReactNode } from 'react';

import { PushPin } from '@/components/ui/PushPin';
import { cn } from '@/utils/cn';

interface BoardLabelProps {
    as?: 'h2' | 'p';
    id?: string;
    pinned?: boolean;
    className?: string;
    children: ReactNode;
}

export const BoardLabel = ({ as: Tag = 'h2', id, pinned = true, className, children }: BoardLabelProps) => (
    <Tag
        id={id}
        className={cn(
            'bg-surface text-caption text-ink relative inline-flex w-fit -rotate-1 items-center gap-2 rounded-sm px-3 py-1 font-semibold tracking-wide uppercase shadow-[0_2px_6px_rgb(0_0_0/0.35)]',
            className,
        )}
    >
        {pinned ? <PushPin className="absolute -top-4.5 left-1/2 origin-bottom -translate-x-1/2 rotate-15" /> : null}
        {children}
    </Tag>
);
