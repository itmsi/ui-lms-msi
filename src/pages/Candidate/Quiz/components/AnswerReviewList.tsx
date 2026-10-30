import { useId } from 'react';

import { AnswerLine, ReviewStatusBadge, SubmittedAnswerLines } from '@/components/patterns/QuizReview';
import type { ReviewStatus } from '@/components/patterns/QuizReview';
import { Card } from '@/components/ui/Card';
import { strings } from '@/locales/id';
import type { QuestionReview } from '@/types/quiz';
import { hasSubmittedAnswer } from '@/utils/quizReview';

const statusOf = (item: QuestionReview): ReviewStatus => {
    if (item.isCorrect) {
        return 'correct';
    }

    return hasSubmittedAnswer(item) ? 'incorrect' : 'unanswered';
};

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
                                        <ReviewStatusBadge status={status} />
                                    </span>
                                </div>

                                <p className="text-body text-ink font-medium whitespace-pre-line">{item.text}</p>

                                <dl className="bg-background flex flex-col gap-2.5 rounded-lg p-3">
                                    <SubmittedAnswerLines
                                        item={item}
                                        answerLabel={strings.myQuiz.yourAnswer}
                                        filesLabel={strings.myQuiz.yourFiles}
                                    />
                                    {status === 'correct' ? null : (
                                        <AnswerLine
                                            label={strings.myQuiz.correctAnswer}
                                            values={item.correctAnswer}
                                            rich={item.type === 'short_answer'}
                                        />
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
