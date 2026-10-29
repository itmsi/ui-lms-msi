import { Check } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { Suspense, useEffect, useId, useRef } from 'react';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { strings } from '@/locales/id';
import { AnswerEditor } from '@/pages/Candidate/Quiz/answerEditor';
import { AnswerAttachments } from '@/pages/Candidate/Quiz/components/AnswerAttachments';
import { formatEstimate } from '@/pages/Candidate/Quiz/quizModel';
import { popIn } from '@/pages/Candidate/Quiz/quizMotion';
import type { ParticipantOption, ParticipantQuestion, QuizAnswerValue } from '@/types/quiz';
import { cn } from '@/utils/cn';

interface ChoiceListProps {
    name: string;
    labelledBy: string;
    describedBy: string;
    multiple: boolean;
    options: ParticipantOption[];
    value: QuizAnswerValue | undefined;
    onChange: (value: QuizAnswerValue) => void;
}

const toSelected = (value: QuizAnswerValue | undefined): string[] => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

const ChoiceList = ({ name, labelledBy, describedBy, multiple, options, value, onChange }: ChoiceListProps) => {
    const selected = toSelected(value);

    const toggle = (optionId: string, checked: boolean) => {
        if (multiple === false) {
            onChange(optionId);
            return;
        }

        onChange(options.map((item) => item.id).filter((id) => (id === optionId ? checked : selected.includes(id))));
    };

    return (
        <fieldset aria-labelledby={labelledBy} aria-describedby={describedBy} className="flex flex-col gap-2">
            {options.map((item) => {
                const checked = selected.includes(item.id);

                return (
                    <label
                        key={item.id}
                        className={cn(
                            'bg-surface flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-3',
                            'transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out active:scale-[0.99]',
                            'has-focus-visible:outline-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-2',
                            checked
                                ? 'border-primary bg-primary-light ring-primary shadow-sm ring-1'
                                : 'border-line hover:border-primary/60',
                        )}
                    >
                        <input
                            type={multiple ? 'checkbox' : 'radio'}
                            name={name}
                            value={item.id}
                            checked={checked}
                            onChange={(event) => toggle(item.id, event.target.checked)}
                            className="sr-only"
                        />
                        <span
                            aria-hidden="true"
                            className={cn(
                                'flex size-5 shrink-0 items-center justify-center border-2 transition-colors duration-150',
                                multiple ? 'rounded-md' : 'rounded-full',
                                checked ? 'border-primary bg-primary text-white' : 'border-line bg-surface',
                            )}
                        >
                            <AnimatePresence initial={false}>
                                {checked ? (
                                    <m.span key="mark" {...popIn} className="flex items-center justify-center">
                                        {multiple ? (
                                            <Check className="size-3.5" strokeWidth={3} />
                                        ) : (
                                            <span className="size-2 rounded-full bg-white" />
                                        )}
                                    </m.span>
                                ) : null}
                            </AnimatePresence>
                        </span>
                        <span className={cn('text-body text-ink', checked && 'font-medium')}>{item.text}</span>
                    </label>
                );
            })}
        </fieldset>
    );
};

interface QuestionPanelProps {
    question: ParticipantQuestion;
    index: number;
    total: number;
    options: ParticipantOption[];
    value: QuizAnswerValue | undefined;
    onChange: (value: QuizAnswerValue) => void;
    attachments: readonly File[];
    onChangeAttachments: (files: File[]) => void;
    focusOnMount: boolean;
}

export const QuestionPanel = ({
    question,
    index,
    total,
    options,
    value,
    onChange,
    attachments,
    onChangeAttachments,
    focusOnMount,
}: QuestionPanelProps) => {
    const baseId = useId();
    const titleId = `${baseId}-title`;
    const hintId = `${baseId}-hint`;
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (focusOnMount) {
            headingRef.current?.focus();
        }
    }, [focusOnMount]);

    const position = `${strings.myQuiz.questionLabel} ${String(index + 1)} ${strings.myQuiz.of} ${String(total)}`;
    const estimate = formatEstimate(question.estimatedSeconds);
    const meta = [question.points === null ? null : `${String(question.points)} ${strings.myQuiz.pointsSuffix}`, estimate].filter(
        (part): part is string => part !== null,
    );

    return (
        <Card className="flex flex-col gap-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span
                    aria-hidden="true"
                    className="bg-primary-light text-primary-dark text-caption rounded-full px-2.5 py-1 font-semibold tabular-nums"
                >
                    {position}
                </span>
                <span className="text-caption text-muted">{meta.join(' · ')}</span>
            </div>

            <h2 ref={headingRef} id={titleId} tabIndex={-1} className="text-card text-ink font-sans whitespace-pre-line outline-none">
                <span className="sr-only">{`${position}. `}</span>
                {question.text}
            </h2>

            {question.imageUrl === null ? null : (
                <img
                    src={question.imageUrl}
                    alt={strings.myQuiz.questionImageAlt}
                    loading="lazy"
                    className="border-line max-h-80 w-full rounded-lg border object-contain"
                />
            )}

            <p id={hintId} className="text-caption text-muted -mb-2">
                {strings.myQuiz.typeHint[question.type]}
            </p>

            {question.type === 'short_answer' ? (
                <div className="flex flex-col gap-5">
                    <Suspense fallback={<Skeleton className="h-40 rounded-lg" />}>
                        <AnswerEditor
                            label={strings.myQuiz.shortAnswerLabel}
                            value={typeof value === 'string' ? value : ''}
                            onChange={onChange}
                            allowTables
                        />
                    </Suspense>
                    <AnswerAttachments files={attachments} onChange={onChangeAttachments} />
                </div>
            ) : (
                <ChoiceList
                    name={`${baseId}-answer`}
                    labelledBy={titleId}
                    describedBy={hintId}
                    multiple={question.type === 'multiple_answers'}
                    options={options}
                    value={value}
                    onChange={onChange}
                />
            )}
        </Card>
    );
};
