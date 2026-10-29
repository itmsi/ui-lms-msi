import { ClipboardCheck } from 'lucide-react';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { WoodPanel } from '@/components/ui/WoodPanel';
import { useAuth } from '@/hooks/useAuth';
import { strings } from '@/locales/id';
import { QuizSummaryCard } from '@/pages/Candidate/Quiz/components/QuizSummaryCard';
import { useQuizResource } from '@/pages/Candidate/Quiz/hooks/useQuizResource';
import { fetchMyQuizzes } from '@/services/quizService';
import { staggerDelayMs } from '@/utils/motion';

const LIST_KEY = 'my-quizzes';
const GRID_CLASS = 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3';
const REVEAL_STEP_MS = 30;
const REVEAL_MAX_STAGGERED = 9;

const loadList = (_key: string, signal: AbortSignal) => fetchMyQuizzes(signal);

const ListSkeleton = () => (
    <LoadingBlock label={strings.common.loading} className={GRID_CLASS}>
        {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="bg-gradiend flex flex-col gap-4 rounded-sm p-1">
                <Skeleton className="aspect-2/1 w-full rounded-[3px] bg-white/15" />
                <div className="flex flex-col gap-4 p-3">
                    <Skeleton className="h-4 w-3/4 bg-white/15" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 bg-white/15" />
                        <Skeleton className="h-10 bg-white/15" />
                    </div>
                    <Skeleton className="h-6 w-1/2 rounded-full bg-white/15" />
                    <Skeleton className="h-9 w-full bg-white/15" />
                </div>
            </div>
        ))}
    </LoadingBlock>
);

export const MyQuizzes = () => {
    const { user } = useAuth();
    const { state, retry } = useQuizResource(LIST_KEY, loadList);

    return (
        <section className="flex flex-col gap-5">
            <PageHeader title={strings.nav.myQuiz} description={strings.myQuiz.subtitle} />

            <WoodPanel className="flex flex-col gap-3">
                {state.status === 'loading' ? <ListSkeleton /> : null}

                {state.status === 'error' ? (
                    <Card>
                        <ApiErrorState
                            code={state.code === 'not_found' ? 'unknown' : state.code}
                            message={state.message}
                            unauthorizedTitle={strings.myQuiz.unauthorizedTitle}
                            onRetry={retry}
                        />
                    </Card>
                ) : null}

                {state.status === 'success' && state.data.length === 0 ? (
                    <Card>
                        <EmptyState icon={ClipboardCheck} title={strings.myQuiz.emptyTitle} description={strings.myQuiz.emptyBody} />
                    </Card>
                ) : null}

                {state.status === 'success' && state.data.length > 0 ? (
                    <ul aria-label={strings.myQuiz.listLabel} className={GRID_CLASS}>
                        {state.data.map((quiz, index) => (
                            <li
                                key={quiz.id}
                                className="motion-rise"
                                style={{
                                    animationDelay: `${String(staggerDelayMs(index, { stepMs: REVEAL_STEP_MS, maxStaggered: REVEAL_MAX_STAGGERED }))}ms`,
                                }}
                            >
                                <QuizSummaryCard quiz={quiz} userId={user?.id ?? ''} />
                            </li>
                        ))}
                    </ul>
                ) : null}
            </WoodPanel>
        </section>
    );
};

export default MyQuizzes;
