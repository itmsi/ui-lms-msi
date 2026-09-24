import { cn } from '@/utils/cn';

type ProgressTone = 'primary' | 'success' | 'neutral';

interface ProgressBarProps {
    value: number;
    /** Label wajib: progress tidak boleh hanya berupa batang warna. */
    label: string;
    tone?: ProgressTone;
    showValue?: boolean;
    className?: string;
}

const TONE_CLASS: Record<ProgressTone, string> = {
    primary: 'bg-primary',
    success: 'bg-success',
    neutral: 'bg-neutral-line',
};

const clampPercentage = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

export const ProgressBar = ({ value, label, tone = 'primary', showValue = true, className }: ProgressBarProps) => {
    const percentage = clampPercentage(value);

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <div className="flex items-baseline justify-between gap-3">
                <span className="text-muted text-caption font-medium">{label}</span>
                {showValue ? <span className="text-ink text-body font-semibold tabular-nums">{percentage}%</span> : null}
            </div>
            <div
                role="progressbar"
                aria-label={label}
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${percentage}%`}
                className="bg-neutral-soft h-2 w-full overflow-hidden rounded-full"
            >
                <div
                    className={cn('h-full rounded-full transition-[width] duration-500 ease-out', TONE_CLASS[tone])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
