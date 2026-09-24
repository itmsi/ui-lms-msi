import { ChevronDown } from 'lucide-react';
import { useId } from 'react';
import type { SelectHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'className' | 'children'> {
    label: string;
    options: SelectOption[];
    hint?: string;
    error?: string;
    className?: string;
}

/**
 * Memakai `<select>` asli, bukan dropdown kustom: keyboard, pencarian ketik, dan
 * pemilih bawaan perangkat mobile langsung bekerja tanpa harus ditiru ulang.
 */
export const Select = ({ label, options, hint, error, className, ...rest }: SelectProps) => {
    const fieldId = useId();
    const hintId = `${fieldId}-hint`;
    const errorId = `${fieldId}-error`;
    const describedBy = [hint === undefined ? null : hintId, error === undefined ? null : errorId]
        .filter((id): id is string => id !== null)
        .join(' ');

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label htmlFor={fieldId} className="text-body text-ink font-medium">
                {label}
            </label>
            <div className="relative">
                <select
                    id={fieldId}
                    aria-invalid={error === undefined ? undefined : true}
                    aria-describedby={describedBy === '' ? undefined : describedBy}
                    className={cn(
                        'bg-surface text-ink h-12 w-full appearance-none rounded-lg border pr-10 pl-3.5',
                        'text-body transition-colors',
                        'disabled:bg-neutral-soft disabled:cursor-not-allowed',
                        error === undefined ? 'border-line' : 'border-danger',
                    )}
                    {...rest}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    aria-hidden="true"
                    className="text-muted pointer-events-none absolute inset-y-0 right-3.5 my-auto size-4.5"
                />
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
