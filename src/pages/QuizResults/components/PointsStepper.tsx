import { Minus, Plus } from 'lucide-react';
import { useId } from 'react';

import { IconButton } from '@/components/ui/IconButton';
import { strings } from '@/locales/id';
import { cn } from '@/utils/cn';

interface PointsStepperProps {
    label: string;
    value: string;
    points: number | null;
    max: number;
    disabled: boolean;
    onChange: (value: string) => void;
    onStep: (delta: number) => void;
}

const STEP_BUTTON_CLASS = 'border-line bg-surface size-11 border';

export const PointsStepper = ({ label, value, points, max, disabled, onChange, onStep }: PointsStepperProps) => {
    const inputId = useId();
    const ofId = `${inputId}-of`;
    const errorId = `${inputId}-error`;
    const isInvalid = points === null;

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={inputId} className="text-caption text-muted font-semibold">
                {label}
            </label>
            <div className="flex items-center gap-2">
                <IconButton
                    label={strings.quizResults.decrease}
                    icon={<Minus aria-hidden="true" className="size-4" />}
                    onClick={() => onStep(-1)}
                    disabled={disabled || (points !== null && points <= 0)}
                    className={STEP_BUTTON_CLASS}
                />
                <input
                    id={inputId}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={value}
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.value)}
                    aria-invalid={isInvalid || undefined}
                    aria-describedby={isInvalid ? `${ofId} ${errorId}` : ofId}
                    className={cn(
                        'bg-surface text-ink text-body h-11 w-16 rounded-lg border text-center font-semibold tabular-nums transition-colors',
                        'disabled:bg-neutral-soft disabled:cursor-not-allowed',
                        isInvalid ? 'border-danger' : 'border-line',
                    )}
                />
                <IconButton
                    label={strings.quizResults.increase}
                    icon={<Plus aria-hidden="true" className="size-4" />}
                    onClick={() => onStep(1)}
                    disabled={disabled || (points !== null && points >= max)}
                    className={STEP_BUTTON_CLASS}
                />
                <span id={ofId} className="text-body text-muted tabular-nums">
                    {`${strings.quizResults.pointsOf} ${String(max)} ${strings.myQuiz.pointsSuffix}`}
                </span>
            </div>
            {isInvalid ? (
                <p id={errorId} className="text-caption text-danger-ink">
                    {`${strings.quizResults.pointsError} ${String(max)}.`}
                </p>
            ) : null}
        </div>
    );
};
