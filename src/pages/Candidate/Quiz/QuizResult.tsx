import { ClipboardCheck, ClipboardX } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import PageHeaderDetail from '@/components/patterns/PageHeaderDetail';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LinkButton } from '@/components/ui/LinkButton';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { strings } from '@/locales/id';
import { AnswerReviewList } from '@/pages/Candidate/Quiz/components/AnswerReviewList';
import { useQuizResource } from '@/pages/Candidate/Quiz/hooks/useQuizResource';
import { fetchQuizAttempt } from '@/services/quizService';
import type { QuizAttemptResult } from '@/types/quiz';
import { formatFullDateTime } from '@/utils/dateTime';

const LIST_PATH = '/my-quizzes';

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

const ResultView = ({ result }: { result: QuizAttemptResult }) => (
    <>
        <Card className="motion-rise flex flex-col items-center gap-5 p-6 text-center sm:p-8">
            <span aria-hidden="true" className="bg-primary-light text-primary flex size-14 items-center justify-center rounded-full">
                <ClipboardCheck className="size-7" />
            </span>

            <div role="status" className="flex flex-col gap-1.5">
                <h2 className="text-section font-sans">{strings.myQuiz.resultTitle}</h2>
                <p className="text-body text-muted mx-auto max-w-md">{strings.myQuiz.resultMessage}</p>
            </div>

            <ScoreSummary result={result} />

            {result.submittedAt === '' ? null : (
                <p className="text-caption text-muted">{`${strings.myQuiz.submittedAt} ${formatFullDateTime(result.submittedAt)}`}</p>
            )}

            <LinkButton to={LIST_PATH}>{strings.myQuiz.backToList}</LinkButton>
        </Card>

        {result.review.length > 0 ? <AnswerReviewList items={result.review} /> : null}
    </>
);

export const QuizResult = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const { state, retry } = useQuizResource(attemptId, fetchQuizAttempt);

    const result = state.status === 'success' ? state.data : null;

    return (
        <section className="flex flex-col gap-5">
            <PageHeaderDetail
                title={result?.quizTitle ?? strings.nav.myQuiz}
                subtitle={result === null ? null : `${strings.myQuiz.materialPrefix} ${result.moduleTitle}`}
                backPath={LIST_PATH}
            />

            {state.status === 'loading' ? <ResultSkeleton /> : null}

            {state.status === 'error' && state.code === 'not_found' ? (
                <Card>
                    <EmptyState
                        icon={ClipboardX}
                        title={strings.myQuiz.resultNotFoundTitle}
                        description={strings.myQuiz.resultNotFoundBody}
                        action={
                            <LinkButton to={LIST_PATH} size="sm" variant="secondary">
                                {strings.myQuiz.backToList}
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
                        unauthorizedTitle={strings.myQuiz.unauthorizedTitle}
                        onRetry={retry}
                    />
                </Card>
            ) : null}

            {result === null ? null : <ResultView result={result} />}
        </section>
    );
};

export default QuizResult;
