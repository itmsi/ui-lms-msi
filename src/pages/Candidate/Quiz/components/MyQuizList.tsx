import { ClipboardCheck, SearchX } from 'lucide-react';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import { Pagination } from '@/components/patterns/Pagination';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { WoodPanel } from '@/components/ui/WoodPanel';
import type { QuizResourceState } from '@/hooks/useQuizResource';
import { strings } from '@/locales/id';
import { QuizSummaryCard } from '@/pages/Candidate/Quiz/components/QuizSummaryCard';
import type { ParticipantQuizListResult, ParticipantQuizSummary } from '@/types/quiz';
import { staggerDelayMs } from '@/utils/motion';

const GRID_CLASS = 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3';
const REVEAL_STEP_MS = 30;
const REVEAL_MAX_STAGGERED = 9;

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

interface MyQuizListProps {
    state: QuizResourceState<ParticipantQuizListResult>;
    quizzes: ParticipantQuizSummary[];
    hasFilters: boolean;
    onClearFilters: () => void;
    onRetry: () => void;
    onChangePage: (page: number) => void;
}

export const MyQuizList = ({ state, quizzes, hasFilters, onClearFilters, onRetry, onChangePage }: MyQuizListProps) => (
    <>
        <WoodPanel className="flex flex-col gap-3">
            {state.status === 'loading' ? <ListSkeleton /> : null}

            {state.status === 'error' ? (
                <Card>
                    <ApiErrorState
                        code={state.code === 'not_found' ? 'unknown' : state.code}
                        message={state.message}
                        unauthorizedTitle={strings.myQuiz.unauthorizedTitle}
                        onRetry={onRetry}
                    />
                </Card>
            ) : null}

            {state.status === 'success' && quizzes.length === 0 ? (
                <Card>
                    {hasFilters ? (
                        <EmptyState
                            icon={SearchX}
                            title={strings.myQuiz.filteredEmptyTitle}
                            description={strings.myQuiz.filteredEmptyBody}
                            action={
                                <Button variant="secondary" size="sm" onClick={onClearFilters}>
                                    {strings.myQuiz.clearFilter}
                                </Button>
                            }
                        />
                    ) : (
                        <EmptyState icon={ClipboardCheck} title={strings.myQuiz.emptyTitle} description={strings.myQuiz.emptyBody} />
                    )}
                </Card>
            ) : null}

            {quizzes.length > 0 ? (
                <ul aria-label={strings.myQuiz.listLabel} className={GRID_CLASS}>
                    {quizzes.map((quiz, index) => (
                        <li
                            key={quiz.id}
                            className="motion-rise"
                            style={{
                                animationDelay: `${String(staggerDelayMs(index, { stepMs: REVEAL_STEP_MS, maxStaggered: REVEAL_MAX_STAGGERED }))}ms`,
                            }}
                        >
                            <QuizSummaryCard quiz={quiz} />
                        </li>
                    ))}
                </ul>
            ) : null}
        </WoodPanel>

        {state.status === 'success' ? <Pagination pagination={state.data.pagination} onChangePage={onChangePage} disabled={false} /> : null}
    </>
);
