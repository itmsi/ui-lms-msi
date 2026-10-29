import { useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className'> {
    label: string;
    hideLabel?: boolean;
    hint?: string;
    error?: string;
    className?: string;
    textareaClassName?: string;
}

export const Textarea = ({
    label,
    hideLabel = false,
    hint,
    error,
    className,
    textareaClassName,
    rows = 3,
    ...rest
}: TextareaProps) => {
    const fieldId = useId();
    const hintId = `${fieldId}-hint`;
    const errorId = `${fieldId}-error`;
    const describedBy = [hint === undefined ? null : hintId, error === undefined ? null : errorId]
        .filter((id): id is string => id !== null)
        .join(' ');

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label htmlFor={fieldId} className={cn('text-body text-ink font-medium', hideLabel && 'sr-only')}>
                {label}
            </label>
            <textarea
                id={fieldId}
                rows={rows}
                aria-invalid={error === undefined ? undefined : true}
                aria-describedby={describedBy === '' ? undefined : describedBy}
                className={cn(
                    'bg-surface text-ink placeholder:text-muted text-body w-full resize-y rounded-lg border px-3.5 py-2.5 transition-colors',
                    'focus-visible:outline-primary focus-visible:outline-2 focus-visible:-outline-offset-1',
                    'disabled:bg-neutral-soft disabled:cursor-not-allowed',
                    error === undefined ? 'border-line' : 'border-danger',
                    textareaClassName,
                )}
                {...rest}
            />
            {hint === undefined ? null : (
                <p id={hintId} className="text-caption text-muted">
                    {hint}
                </p>
            )}
            {error === undefined ? null : (
                <p id={errorId} className="text-caption text-danger-ink">
                    {error}
                </p>
            )}
        </div>
    );
};
