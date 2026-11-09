import { ChevronDown } from 'lucide-react';
import { useId } from 'react';

import { cn } from '@/utils/cn';

export interface InlineSelectOption<T extends string> {
    value: T;
    label: string;
}

interface InlineSelectProps<T extends string> {
    label: string;
    options: readonly InlineSelectOption<T>[];
    value: T;
    onChange: (value: T) => void;
    layout?: 'inline' | 'stacked';
    hideLabel?: boolean;
    disabled?: boolean;
    className?: string;
    selectClassName?: string;
}

export const InlineSelect = <T extends string>({
    label,
    options,
    value,
    onChange,
    layout = 'inline',
    hideLabel = false,
    disabled = false,
    className,
    selectClassName,
}: InlineSelectProps<T>) => {
    const fieldId = useId();

    return (
        <div
            className={cn(
                'flex',
                layout === 'inline' ? 'text-caption text-muted items-center gap-2' : 'flex-col gap-1.5',
                className,
            )}
        >
            <label
                htmlFor={fieldId}
                className={cn(layout === 'stacked' && 'text-body text-ink font-medium', hideLabel && 'sr-only')}
            >
                {label}
            </label>
            <span className="relative inline-flex">
                <select
                    id={fieldId}
                    value={value}
                    disabled={disabled}
                    onChange={(event) => {
                        const picked = options.find((option) => option.value === event.target.value);

                        if (picked !== undefined) {
                            onChange(picked.value);
                        }
                    }}
                    className={cn(
                        'border-line bg-surface text-ink text-body hover:border-primary h-9 w-full appearance-none rounded-lg border pr-8 pl-3 transition-colors',
                        'focus-visible:outline-primary focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-60',
                        selectClassName,
                    )}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    aria-hidden="true"
                    className="text-muted pointer-events-none absolute inset-y-0 right-2.5 my-auto size-4"
                />
            </span>
        </div>
    );
};
