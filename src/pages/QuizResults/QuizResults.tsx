import { ListChecks, SearchX } from 'lucide-react';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import { PageHeader } from '@/components/patterns/PageHeader';
import { SearchBar } from '@/components/patterns/SearchBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { SegmentedOption } from '@/components/ui/SegmentedControl';
import { Select } from '@/components/ui/Select';
import { useQuizResource } from '@/hooks/useQuizResource';
import { strings } from '@/locales/id';
import { QuizResultsTable } from '@/pages/QuizResults/components/QuizResultsTable';
import { useQuizResults } from '@/pages/QuizResults/hooks/useQuizResults';
import { fetchQuizOptions } from '@/services/quizResultService';
import type { QuizResultStatusFilter } from '@/types/quizResult';

const QUIZ_OPTIONS_KEY = 'quiz-options';

const loadQuizOptions = (_key: string, signal: AbortSignal) => fetchQuizOptions(signal);

const STATUS_OPTIONS: SegmentedOption<QuizResultStatusFilter>[] = [
    { value: 'all', label: strings.quizResults.statusAll },
    { value: 'completed', label: strings.quizResults.status.completed },
    { value: 'not_completed', label: strings.quizResults.status.not_completed },
];

export const QuizResults = () => {
    const {
        state,
        lastPagination,
        page,
        pageSize,
        search,
        quizId,
        status,
        hasFilters,
        submitSearch,
        selectQuiz,
        selectStatus,
        clearFilters,
        goToPage,
        selectPageSize,
        retry,
    } = useQuizResults();
    const { state: quizOptionsState } = useQuizResource(QUIZ_OPTIONS_KEY, loadQuizOptions);

    const isLoading = state.status === 'loading';
    const quizOptions = quizOptionsState.status === 'success' ? quizOptionsState.data : [];
    const selectOptions = [
        { value: '', label: strings.quizResults.allQuizzes },
        ...quizOptions.map((quiz) => ({ value: quiz.id, label: quiz.title })),
    ];

    return (
        <section className="flex flex-col gap-5">
            <PageHeader title={strings.nav.quizResults} description={strings.quizResults.subtitle} />

            <div className="flex flex-col gap-3">
                <SearchBar
                    label={strings.quizResults.searchLabel}
                    placeholder={strings.quizResults.searchPlaceholder}
                    value={search}
                    onSubmit={submitSearch}
                    hasFilters={hasFilters}
                    onClear={clearFilters}
                    disabled={isLoading}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <Select
                        label={strings.quizResults.quizFilterLabel}
                        options={selectOptions}
                        value={quizOptionsState.status === 'success' ? (quizId ?? '') : ''}
                        onChange={(event) => selectQuiz(event.target.value === '' ? null : event.target.value)}
                        disabled={quizOptionsState.status !== 'success'}
                        hint={quizOptionsState.status === 'error' ? strings.quizResults.quizOptionsFailed : undefined}
                        className="sm:w-96"
                    />
                    <SegmentedControl
                        label={strings.quizResults.statusFilterLabel}
                        showlabel
                        options={STATUS_OPTIONS}
                        value={status}
                        onChange={selectStatus}
                        disabled={isLoading}
                    />
                </div>
            </div>

            {state.status === 'error' ? (
                <Card>
                    <ApiErrorState
                        code={state.code === 'not_found' ? 'unknown' : state.code}
                        message={state.message}
                        unauthorizedTitle={strings.quizResults.unauthorizedTitle}
                        onRetry={retry}
                    />
                </Card>
            ) : (
                <QuizResultsTable
                    items={state.status === 'success' ? state.result.items : []}
                    loading={isLoading}
                    pagination={state.status === 'success' ? state.result.pagination : lastPagination}
                    page={page}
                    pageSize={pageSize}
                    onChangePage={goToPage}
                    onChangeRowsPerPage={selectPageSize}
                    emptyIcon={hasFilters ? SearchX : ListChecks}
                    emptyTitle={hasFilters ? strings.quizResults.filteredEmptyTitle : strings.quizResults.emptyTitle}
                    emptyDescription={hasFilters ? strings.quizResults.filteredEmptyBody : strings.quizResults.emptyBody}
                    emptyAction={
                        hasFilters ? (
                            <Button variant="secondary" size="sm" onClick={clearFilters}>
                                {strings.quizResults.clearFilters}
                            </Button>
                        ) : undefined
                    }
                />
            )}
        </section>
    );
};

export default QuizResults;
