import { ClipboardX } from 'lucide-react';
import { useId, useState } from 'react';
import { useParams } from 'react-router-dom';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import PageHeaderDetail from '@/components/patterns/PageHeaderDetail';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LinkButton } from '@/components/ui/LinkButton';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { useBackToList } from '@/hooks/useBackToList';
import { useQuizResource } from '@/hooks/useQuizResource';
import { strings } from '@/locales/id';
import { GradingQuestionCard } from '@/pages/QuizResults/components/GradingQuestionCard';
import { GradingSaveBar } from '@/pages/QuizResults/components/GradingSaveBar';
import { GradingSummary } from '@/pages/QuizResults/components/GradingSummary';
import { useQuizGrading } from '@/pages/QuizResults/hooks/useQuizGrading';
import { QUIZ_RESULTS_PATH } from '@/pages/QuizResults/paths';
import { fetchGradingAttempt } from '@/services/quizResultService';
import type { GradingAttempt } from '@/types/quizResult';

const DetailSkeleton = () => (
    <LoadingBlock label={strings.common.loading} className="flex flex-col gap-4">
        <Card className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex flex-col gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-40 max-w-full" />
                </div>
            ))}
        </Card>
        {Array.from({ length: 3 }, (_, index) => (
            <Card key={index} className="flex flex-col gap-3 p-5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-full max-w-xl" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-11 w-48 rounded-lg" />
            </Card>
        ))}
    </LoadingBlock>
);

const GradingView = ({ attempt }: { attempt: GradingAttempt }) => {
    const grading = useQuizGrading(attempt);
    const backToList = useBackToList(QUIZ_RESULTS_PATH);
    const [leaveOpen, setLeaveOpen] = useState(false);
    const headingId = useId();
    const { saved } = grading;

    return (
        <>
            <PageHeaderDetail
                title={saved.employeeName}
                subtitle={`${strings.quizResults.quizPrefix} ${saved.quizTitle}`}
                backPath={() => {
                    if (grading.isDirty) {
                        setLeaveOpen(true);
                        return;
                    }

                    backToList();
                }}
            />

            <GradingSummary attempt={saved} draftScore={grading.draftScore} isDirty={grading.isDirty} />

            <section aria-labelledby={headingId} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <h2 id={headingId} className="text-section font-sans">
                        {strings.quizResults.gradingHeading}
                    </h2>
                    <p className="text-body text-muted max-w-3xl">{strings.quizResults.gradingHint}</p>
                </div>

                <ol className="flex flex-col gap-3">
                    {grading.rows.map((row) => (
                        <li key={row.item.questionId}>
                            <GradingQuestionCard
                                row={row}
                                disabled={grading.isSaving}
                                onChange={(value) => grading.setPoints(row.item.questionId, value)}
                                onStep={(delta) => grading.stepPoints(row.item, delta)}
                            />
                        </li>
                    ))}
                </ol>
            </section>

            {grading.isDirty ? (
                <GradingSaveBar
                    changedCount={grading.changedCount}
                    draftScore={grading.draftScore}
                    savedScore={saved.score}
                    maxScore={saved.maxScore}
                    isSaving={grading.isSaving}
                    onDiscard={grading.discard}
                    onSave={() => void grading.save()}
                />
            ) : null}

            <ConfirmDialog
                open={leaveOpen}
                title={strings.quizResults.leaveTitle}
                description={strings.quizResults.leaveBody}
                confirmLabel={strings.quizResults.leaveConfirm}
                cancelLabel={strings.quizResults.leaveCancel}
                onConfirm={() => {
                    setLeaveOpen(false);
                    backToList();
                }}
                onCancel={() => setLeaveOpen(false)}
            />
        </>
    );
};

export const QuizResultDetail = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const { state, retry } = useQuizResource(attemptId, fetchGradingAttempt);
    const backToList = useBackToList(QUIZ_RESULTS_PATH);

    if (state.status === 'success') {
        return (
            <section className="flex flex-col gap-5">
                <GradingView key={state.data.id} attempt={state.data} />
            </section>
        );
    }

    return (
        <section className="flex flex-col gap-5">
            <PageHeaderDetail title={strings.quizResults.detailFallbackTitle} backPath={backToList} />

            {state.status === 'loading' ? <DetailSkeleton /> : null}

            {state.status === 'error' && state.code === 'not_found' ? (
                <Card>
                    <EmptyState
                        icon={ClipboardX}
                        title={strings.quizResults.notFoundTitle}
                        description={strings.quizResults.notFoundBody}
                        action={
                            <LinkButton to={QUIZ_RESULTS_PATH} size="sm" variant="secondary">
                                {strings.quizResults.backToList}
                            </LinkButton>
                        }
                    />
                </Card>
            ) : null}

            {state.status === 'error' && state.code !== 'not_found' ? (
                <Card>
                    <ApiErrorState
                        code={state.code}
                        message={state.message}
                        unauthorizedTitle={strings.quizResults.unauthorizedTitle}
                        onRetry={retry}
                    />
                </Card>
            ) : null}
        </section>
    );
};

export default QuizResultDetail;
