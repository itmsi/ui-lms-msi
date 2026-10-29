import { cn } from '@/utils/cn';

interface SwitchProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    hideLabel?: boolean;
    disabled?: boolean;
    className?: string;
}

export const Switch = ({ label, checked, onChange, hideLabel = false, disabled = false, className }: SwitchProps) => (
    <label
        className={cn(
            'text-body text-ink inline-flex cursor-pointer items-center gap-2 select-none',
            disabled && 'cursor-not-allowed opacity-60',
            className,
        )}
    >
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(checked === false)}
            className={cn(
                'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
                'focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed',
                checked ? 'bg-primary' : 'bg-neutral-line',
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    'bg-surface inline-block size-4 rounded-full shadow-sm transition-transform',
                    checked ? 'translate-x-4.5' : 'translate-x-0.5',
                )}
            />
        </button>
        <span className={cn(hideLabel && 'sr-only')}>{label}</span>
    </label>
);
