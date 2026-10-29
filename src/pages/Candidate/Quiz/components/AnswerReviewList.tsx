import { CircleCheck, CircleDashed, CircleDot } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useId } from 'react';

import { Card } from '@/components/ui/Card';
import { strings } from '@/locales/id';
import type { QuestionReview } from '@/types/quiz';
import { cn } from '@/utils/cn';

type ReviewStatus = 'correct' | 'incorrect' | 'unanswered';

const STATUS_STYLE: Record<ReviewStatus, { icon: LucideIcon; label: string; className: string }> = {
    correct: { icon: CircleCheck, label: strings.myQuiz.reviewCorrect, className: 'bg-success-soft text-success-ink' },
    incorrect: { icon: CircleDot, label: strings.myQuiz.reviewIncorrect, className: 'bg-warning-soft text-warning-ink' },
    unanswered: { icon: CircleDashed, label: strings.myQuiz.noAnswer, className: 'bg-neutral-soft text-neutral-ink' },
};

const statusOf = (item: QuestionReview): ReviewStatus => {
    if (item.isCorrect) {
        return 'correct';
    }

    return item.yourAnswer.length === 0 ? 'unanswered' : 'incorrect';
};

const AnswerLine = ({ label, values }: { label: string; values: string[] }) => (
    <div className="flex flex-col gap-0.5">
        <dt className="text-caption text-muted">{label}</dt>
        <dd className="text-body text-ink">{values.length === 0 ? strings.myQuiz.noAnswer : values.join(', ')}</dd>
    </div>
);

export const AnswerReviewList = ({ items }: { items: QuestionReview[] }) => {
    const headingId = useId();

    return (
        <section aria-labelledby={headingId} className="flex flex-col gap-3">
            <h2 id={headingId} className="text-section font-sans">
                {strings.myQuiz.reviewHeading}
            </h2>

            <ol className="flex flex-col gap-3">
                {items.map((item) => {
                    const status = statusOf(item);
                    const { icon: Icon, label, className } = STATUS_STYLE[status];

                    return (
                        <li key={item.questionId}>
                            <Card className="flex flex-col gap-3 p-4 sm:p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-caption text-muted font-semibold tabular-nums">
                                        {`${strings.myQuiz.questionLabel} ${String(item.line)}`}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="text-caption text-muted tabular-nums">
                                            {`${String(item.pointsEarned)}/${String(item.points)} ${strings.myQuiz.pointsSuffix}`}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-caption inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium',
                                                className,
                                            )}
                                        >
                                            <Icon aria-hidden="true" className="size-3.5" />
                                            {label}
                                        </span>
                                    </span>
                                </div>

                                <p className="text-body text-ink font-medium whitespace-pre-line">{item.text}</p>

                                <dl className="bg-background flex flex-col gap-2.5 rounded-lg p-3">
                                    <AnswerLine label={strings.myQuiz.yourAnswer} values={item.yourAnswer} />
                                    {status === 'correct' ? null : (
                                        <AnswerLine label={strings.myQuiz.correctAnswer} values={item.correctAnswer} />
                                    )}
                                </dl>
                            </Card>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
};
