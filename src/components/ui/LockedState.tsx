import { Lock } from 'lucide-react';

import { strings } from '@/locales/id';
import { cn } from '@/utils/cn';

interface LockedStateProps {
    title?: string;
    reason: string;
    requirement: string;
    unlocks: string;
    variant?: 'card' | 'inline';
    className?: string;
}

export const LockedState = ({
    title = strings.states.lockedTitle,
    reason,
    requirement,
    unlocks,
    variant = 'card',
    className,
}: LockedStateProps) => (
    <div
        className={cn(
            variant === 'card' ? 'bg-neutral-soft/60 border-line rounded-card border p-5' : 'py-2',
            className,
        )}
    >
        <div className="flex items-start gap-3">
            <span className="bg-neutral-soft text-neutral-ink flex size-9 shrink-0 items-center justify-center rounded-full">
                <Lock aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0">
                <p className="text-card text-ink">{title}</p>
                <dl className="mt-3 flex flex-col gap-2">
                    <div>
                        <dt className="text-caption text-muted font-medium">{strings.states.lockedWhy}</dt>
                        <dd className="text-body text-ink">{reason}</dd>
                    </div>
                    <div>
                        <dt className="text-caption text-muted font-medium">{strings.states.lockedRequirement}</dt>
                        <dd className="text-body text-ink">{requirement}</dd>
                    </div>
                    <div>
                        <dt className="text-caption text-muted font-medium">{strings.states.lockedAfter}</dt>
                        <dd className="text-body text-ink">{unlocks}</dd>
                    </div>
                </dl>
            </div>
        </div>
    </div>
);
