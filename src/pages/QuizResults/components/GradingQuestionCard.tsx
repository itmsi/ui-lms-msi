import { CircleDot } from 'lucide-react';

import { AnswerLine, ReviewStatusBadge, SubmittedAnswerLines } from '@/components/patterns/QuizReview';
import type { ReviewStatus } from '@/components/patterns/QuizReview';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { strings } from '@/locales/id';
import { PointsStepper } from '@/pages/QuizResults/components/PointsStepper';
import type { GradingRow } from '@/pages/QuizResults/hooks/useQuizGrading';
import { cn } from '@/utils/cn';
import { hasSubmittedAnswer } from '@/utils/quizReview';
import { QuestionImage } from '@/pages/Candidate/Quiz/components/QuestionImage';

const statusOf = (row: GradingRow): ReviewStatus => {
    if (hasSubmittedAnswer(row.item) === false) {
        return 'unanswered';
    }

    const points = row.points ?? row.item.pointsEarned;

    return row.item.points > 0 && points === row.item.points ? 'correct' : 'incorrect';
};

interface GradingQuestionCardProps {
    row: GradingRow;
    disabled: boolean;
    onChange: (value: string) => void;
    onStep: (delta: number) => void;
}

export const GradingQuestionCard = ({ row, disabled, onChange, onStep }: GradingQuestionCardProps) => {
    const { item } = row;
    const points = row.points ?? item.pointsEarned;
    const status = statusOf(row);
    return (
        <Card className={cn('flex flex-col gap-4 p-4 transition-shadow sm:p-5', row.isChanged && 'ring-primary/40 ring-2')}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-caption text-muted font-semibold tabular-nums">
                    {`${strings.myQuiz.questionLabel} ${String(item.line)} · ${strings.quizContent.type[item.type]}`}
                </span>
                <ReviewStatusBadge status={status} />
            </div>

            <p className="font-display text-ink text-lg font-bold whitespace-pre-line">{item.text}</p>

            {item.imageUrl === null ? null : <QuestionImage url={item.imageUrl} />}

            <dl className="flex flex-col gap-2">
                <SubmittedAnswerLines
                    item={item}
                    answerLabel={strings.quizResults.employeeAnswer}
                    filesLabel={strings.quizResults.employeeFiles}
                    status={status}
                />
                <AnswerLine
                    label={strings.quizResults.correctAnswer}
                    values={item.correctAnswer}
                    rich={item.type === 'short_answer'}
                    status="correct"
                />
            </dl>

            <div className="border-line flex flex-wrap items-end justify-between gap-3 border-t pt-4">
                <PointsStepper
                    label={`${strings.quizResults.pointsLabel} ${String(item.line)}`}
                    value={row.value}
                    points={row.points}
                    max={item.points}
                    disabled={disabled}
                    onChange={onChange}
                    onStep={onStep}
                />
                <div className="flex flex-wrap items-center gap-2 pb-2.5">
                    {item.autoPointsEarned === points ? null : (
                        <span className="text-caption text-muted tabular-nums">
                            {`${strings.quizResults.autoPoints}: ${String(item.autoPointsEarned)} ${strings.myQuiz.pointsSuffix}`}
                        </span>
                    )}
                    {row.isChanged ? (
                        <Badge tone="primary" size="sm" icon={CircleDot}>
                            {strings.quizResults.unsavedChip}
                        </Badge>
                    ) : null}
                </div>
            </div>
        </Card>
    );
};
