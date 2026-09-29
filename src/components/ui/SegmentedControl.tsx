import { cn } from '@/utils/cn';

export interface SegmentedOption<T extends string> {
    value: T;
    label: string;
}

interface SegmentedControlProps<T extends string> {
    label: string;
    options: SegmentedOption<T>[];
    value: T;
    onChange: (value: T) => void;
    disabled?: boolean;
}

export const SegmentedControl = <T extends string>({
    label,
    options,
    value,
    onChange,
    disabled = false,
}: SegmentedControlProps<T>) => (
    <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-caption text-muted hidden sm:inline">
            {label}
        </span>

        <div
            role="group"
            aria-label={label}
            className="border-line bg-surface flex items-center gap-1 rounded-full border p-1"
        >
            {options.map((option) => {
                const isActive = value === option.value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={isActive}
                        disabled={disabled}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'text-caption rounded-full px-3 py-1.5 font-medium transition-colors',
                            'disabled:cursor-not-allowed disabled:opacity-60',
                            isActive
                                ? 'bg-primary-light text-primary-dark'
                                : 'text-muted hover:bg-neutral-soft hover:text-ink',
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    </div>
);
