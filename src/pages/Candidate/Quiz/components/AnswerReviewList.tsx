import { AnswerLine, ReviewStatusBadge, SubmittedAnswerLines } from '@/components/patterns/QuizReview';
import type { ReviewStatus } from '@/components/patterns/QuizReview';
import { Card } from '@/components/ui/Card';
import { strings } from '@/locales/id';
import { QuestionImage } from '@/pages/Candidate/Quiz/components/QuestionImage';
import type { QuestionReview } from '@/types/quiz';
import { hasSubmittedAnswer } from '@/utils/quizReview';

const statusOf = (item: QuestionReview): ReviewStatus => {
    if (item.isCorrect) {
        return 'correct';
    }

    return hasSubmittedAnswer(item) ? 'incorrect' : 'unanswered';
};

export const AnswerReviewList = ({ items }: { items: QuestionReview[] }) => (
    <section aria-label={strings.myQuiz.reviewHeading}>
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

                            <p className="font-display text-ink text-lg font-bold whitespace-pre-line">{item.text}</p>

                            {item.imageUrl === null ? null : <QuestionImage url={item.imageUrl} />}

                            <dl className="flex flex-col gap-2">
                                <SubmittedAnswerLines
                                    item={item}
                                    answerLabel={strings.myQuiz.yourAnswer}
                                    filesLabel={strings.myQuiz.yourFiles}
                                    status={status}
                                />
                                {status === 'correct' ? null : (
                                    <AnswerLine
                                        label={strings.myQuiz.correctAnswer}
                                        values={item.correctAnswer}
                                        rich={item.type === 'short_answer'}
                                        status="correct"
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
