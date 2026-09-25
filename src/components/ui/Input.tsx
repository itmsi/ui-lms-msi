import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
    label: string;
    hideLabel?: boolean;
    hint?: string;
    error?: string;
    leading?: ReactNode;
    trailing?: ReactNode;
    className?: string;
    inputClassName?: string;
}

export const Input = ({
    label,
    hideLabel = false,
    hint,
    error,
    leading,
    trailing,
    className,
    inputClassName,
    ...rest
}: InputProps) => {
    const inputId = useId();
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;
    const describedBy = [hint === undefined ? null : hintId, error === undefined ? null : errorId]
        .filter((id): id is string => id !== null)
        .join(' ');

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label htmlFor={inputId} className={cn('text-body text-ink font-medium', hideLabel && 'sr-only')}>
                {label}
            </label>
            <div className="relative">
                {leading === undefined ? null : (
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">{leading}</div>
                )}
                <input
                    id={inputId}
                    aria-invalid={error === undefined ? undefined : true}
                    aria-describedby={describedBy === '' ? undefined : describedBy}
                    className={cn(
                        'bg-surface text-ink placeholder:text-muted h-12 w-full rounded-lg border px-3.5',
                        'text-body transition-colors',
                        'disabled:bg-neutral-soft disabled:cursor-not-allowed',
                        error === undefined ? 'border-line' : 'border-danger',
                        leading === undefined ? null : 'pl-11',
                        trailing === undefined ? null : 'pr-12',
                        inputClassName,
                    )}
                    {...rest}
                />
                {trailing === undefined ? null : (
                    <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>
                )}
            </div>
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
