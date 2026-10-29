import { Check, GraduationCap, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useId } from 'react';

import { strings } from '@/locales/id';
import { QUIZ_AUDIENCES } from '@/pages/QuizMaterials/types';
import type { QuizAudience } from '@/pages/QuizMaterials/types';
import { cn } from '@/utils/cn';

const AUDIENCE_ICON: Record<QuizAudience, LucideIcon> = {
    reguler: UsersRound,
    mt: GraduationCap,
};

interface QuizAudienceFieldProps {
    value: readonly QuizAudience[];
    onChange: (value: QuizAudience[]) => void;
    error?: string;
}

export const QuizAudienceField = ({ value, onChange, error }: QuizAudienceFieldProps) => {
    const fieldId = useId();
    const hintId = `${fieldId}-hint`;
    const errorId = `${fieldId}-error`;

    const toggle = (audience: QuizAudience, checked: boolean) => {
        onChange(QUIZ_AUDIENCES.filter((item) => (item === audience ? checked : value.includes(item))));
    };

    return (
        <fieldset aria-describedby={error === undefined ? hintId : `${hintId} ${errorId}`} className="flex flex-col gap-1.5">
            <legend className="text-body text-ink font-medium">
                {strings.quizForm.audienceLabel}
                <span aria-hidden="true" className="text-danger-ink">
                    {' '}
                    *
                </span>
            </legend>
            <p id={hintId} className="text-caption text-muted -mt-1 mb-0.5">
                {strings.quizForm.audienceGroupHint}
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
                {QUIZ_AUDIENCES.map((audience) => {
                    const Icon = AUDIENCE_ICON[audience];
                    const checked = value.includes(audience);

                    return (
                        <label
                            key={audience}
                            className={cn(
                                'bg-surface relative flex cursor-pointer items-start gap-3 rounded-lg border p-3 pr-10 transition-colors',
                                'has-focus-visible:outline-primary has-focus-visible:outline-2',
                                checked ? 'border-primary bg-primary-light' : 'border-line hover:border-primary/60',
                                error !== undefined && 'border-danger/60',
                            )}
                        >
                            <input
                                type="checkbox"
                                value={audience}
                                checked={checked}
                                onChange={(event) => toggle(audience, event.target.checked)}
                                className="sr-only"
                            />
                            <span
                                aria-hidden="true"
                                className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                                    checked ? 'bg-primary text-white' : 'bg-neutral-soft text-neutral-ink',
                                )}
                            >
                                <Icon className="size-4.5" />
                            </span>
                            <span className="flex min-w-0 flex-col">
                                <span className="text-body text-ink font-semibold">{strings.quizForm.audience[audience]}</span>
                                <span className="text-caption text-muted">{strings.quizForm.audienceHint[audience]}</span>
                            </span>
                            <span
                                aria-hidden="true"
                                className={cn(
                                    'absolute top-3 right-3 flex size-5 items-center justify-center rounded-md border transition-colors',
                                    checked ? 'border-primary bg-primary text-white' : 'border-line bg-surface',
                                )}
                            >
                                {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
                            </span>
                        </label>
                    );
                })}
            </div>

            {error === undefined ? null : (
                <p id={errorId} className="text-caption text-danger-ink">
                    {error}
                </p>
            )}
        </fieldset>
    );
};
