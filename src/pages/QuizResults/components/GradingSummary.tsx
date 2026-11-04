import { ArrowRight, PencilLine } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { strings } from '@/locales/id';
import type { GradingAttempt } from '@/pages/QuizResults/types';
import { formatFullDateTime } from '@/utils/dateTime';

const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-caption text-muted font-semibold">{label}</dt>
        <dd className="text-body text-ink min-w-0">{children}</dd>
    </div>
);

interface GradingSummaryProps {
    attempt: GradingAttempt;
    draftScore: number;
    isDirty: boolean;
}

export const GradingSummary = ({ attempt, draftScore, isDirty }: GradingSummaryProps) => {
    const shownScore = isDirty ? draftScore : attempt.score;
    const percentage = attempt.maxScore === 0 ? 0 : (shownScore / attempt.maxScore) * 100;

    return (
        <Card className="flex flex-col gap-4 p-5 sm:p-6">
            <h3 className="text-section font-display">{attempt.quizTitle}</h3>
            <dl className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                <div className="gap-3 flex flex-col">
                    <Fact label={strings.myQuiz.materialPrefix}>
                        <span className="font-medium">{attempt.moduleTitle}</span>
                    </Fact>
                    <Fact label={strings.quizResults.employeeLabel}>
                        <span className="font-medium">{attempt.employeeName}</span>
                    </Fact>
                    <Fact label={strings.quizResults.submittedLabel}>
                        {attempt.submittedAt === '' ? (
                            '—'
                        ) : (
                            <time dateTime={attempt.submittedAt} className="tabular-nums">
                                {formatFullDateTime(attempt.submittedAt)}
                            </time>
                        )}
                    </Fact>
                </div>
                <Fact label={strings.quizResults.scoreLabel}>
                    <span className="flex flex-col gap-2">
                        <span className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
                            {isDirty && draftScore !== attempt.score ? (
                                <>
                                    <span className="text-muted line-through">{attempt.score}</span>
                                    <ArrowRight aria-hidden="true" className="text-muted size-4 self-center" />
                                    <span className="sr-only">{`${strings.quizResults.newScore}:`}</span>
                                </>
                            ) : null}
                            <span className="text-section text-ink font-semibold">{shownScore}</span>
                            <span className="text-muted">{`/ ${String(attempt.maxScore)} ${strings.myQuiz.pointsSuffix}`}</span>
                        </span>
                        <ProgressBar value={percentage} label={strings.quizResults.scoreLabel} showValue={false} />
                        <span className="text-caption text-muted tabular-nums">
                            {`${String(attempt.correctCount)} ${strings.myQuiz.of} ${String(attempt.questionCount)} ${strings.quizResults.correctSuffix}`}
                        </span>
                    </span>
                </Fact>
            </dl>

            {attempt.adjustedAt === null ? null : (
                <p className="text-caption text-muted border-line flex items-start gap-1.5 border-t pt-3">
                    <PencilLine aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                        {`${strings.quizResults.adjustedNote} ${formatFullDateTime(attempt.adjustedAt)}`}
                        {attempt.adjustedByName === null ? null : ` ${strings.quizResults.adjustedBy} ${attempt.adjustedByName}`}
                    </span>
                </p>
            )}
        </Card>
    );
};
