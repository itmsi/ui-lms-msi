import { ClipboardCheck, ClipboardX } from 'lucide-react';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import PageHeaderDetail from '@/components/patterns/PageHeaderDetail';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useActivityLog, useLogOnce } from '@/hooks/useActivityLog';
import { useAuth } from '@/hooks/useAuth';
import { useBackToList } from '@/hooks/useBackToList';
import { useQuizResource } from '@/hooks/useQuizResource';
import { strings } from '@/locales/id';
import { AnswerReviewList } from '@/pages/Candidate/Quiz/components/AnswerReviewList';
import { fetchQuizResult } from '@/pages/Candidate/Quiz/services/quizService';
import { MY_QUIZ_LIST_PATH } from '@/pages/Candidate/Quiz/utils/paths';
import type { QuizAttemptResult } from '@/types/quiz';
import { formatFullDateTime } from '@/utils/dateTime';
import { isGradingPending } from '@/utils/quizReview';

const ResultSkeleton = () => (
    <LoadingBlock label={strings.common.loading}>
        <Card className="flex flex-col items-center gap-4 p-6">
            <Skeleton className="size-14 rounded-full" />
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
            <Skeleton className="h-10 w-40" />
        </Card>
    </LoadingBlock>
);

const ScoreSummary = ({ result }: { result: QuizAttemptResult }) => {
    const percentage = result.maxScore === 0 ? 0 : (result.score / result.maxScore) * 100;

    return (
        <div className="flex w-full max-w-sm flex-col gap-3">
            <p className="tabular-nums">
                <span className="text-page text-ink">{result.score}</span>
                <span className="text-body text-muted">{` / ${String(result.maxScore)} ${strings.myQuiz.pointsSuffix}`}</span>
            </p>
            <ProgressBar value={percentage} label={strings.myQuiz.scoreLabel} />
            <p className="text-caption text-muted tabular-nums">
                {`${String(result.correctCount)} ${strings.myQuiz.of} ${String(result.questionCount)} ${strings.myQuiz.correctSuffix}`}
            </p>
        </div>
    );
};

const ResultView = ({ result, onBack }: { result: QuizAttemptResult; onBack: () => void }) => {
    const isPending = isGradingPending(result.gradingStatus);
    return (
        <>
            <Card className="motion-rise flex flex-col items-center gap-5 p-6 text-center sm:p-8">
                <span aria-hidden="true" className="bg-primary-light text-primary flex size-14 items-center justify-center rounded-full">
                    <ClipboardCheck className="size-7" />
                </span>

                <div role="status" className="flex flex-col gap-1.5">
                    <h2 className="text-section font-sans">{strings.myQuiz.resultTitle}</h2>
                    <p className="text-body text-muted mx-auto max-w-md">
                        {isPending ? strings.myQuiz.resultPendingMessage : strings.myQuiz.resultMessage}
                    </p>
                </div>

                {isPending ? null : <ScoreSummary result={result} />}

                {result.submittedAt === '' ? null : (
                    <p className="text-caption text-muted">{`${strings.myQuiz.submittedAt} ${formatFullDateTime(result.submittedAt)}`}</p>
                )}

                <Button onClick={onBack}>{strings.myQuiz.backToList}</Button>
            </Card>

            {result.review.length > 0 ? <AnswerReviewList items={result.review} isPending={isPending} /> : null}
        </>
    );
};

export const QuizResult = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const { user } = useAuth();
    const userId = user?.id ?? '';
    const load = useCallback((id: string, signal: AbortSignal) => fetchQuizResult(id, userId, signal), [userId]);
    const { state, retry } = useQuizResource(quizId, load);
    const backToList = useBackToList(MY_QUIZ_LIST_PATH);
    const activity = useActivityLog();

    const result = state.status === 'success' ? state.data : null;

    useLogOnce(result === null ? null : (quizId ?? null), () => {
        if (result !== null) {
            activity.quizResultViewed(result.quizTitle);
        }
    });

    return (
        <section className="flex flex-col gap-5">
            <PageHeaderDetail
                title={result?.quizTitle ?? strings.nav.myQuiz}
                subtitle={result === null ? null : `${strings.myQuiz.materialPrefix} ${result.moduleTitle}`}
                backPath={backToList}
            />

            {state.status === 'loading' ? <ResultSkeleton /> : null}

            {state.status === 'error' && state.code === 'not_found' ? (
                <Card>
                    <EmptyState
                        icon={ClipboardX}
                        title={strings.myQuiz.resultNotFoundTitle}
                        description={strings.myQuiz.resultNotFoundBody}
                        action={
                            <Button size="sm" variant="secondary" onClick={backToList}>
                                {strings.myQuiz.backToList}
                            </Button>
                        }
                    />
                </Card>
            ) : null}

            {state.status === 'error' && state.code !== 'not_found' ? (
                <Card>
                    <ApiErrorState
                        code={state.code}
                        message={state.message}
                        unauthorizedTitle={strings.myQuiz.unauthorizedTitle}
                        onRetry={retry}
                    />
                </Card>
            ) : null}

            {result === null ? null : <ResultView result={result} onBack={backToList} />}
        </section>
    );
};

export default QuizResult;
