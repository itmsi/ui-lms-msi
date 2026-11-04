import { PageHeader } from '@/components/patterns/PageHeader';
import { strings } from '@/locales/id';
import { FilterSection } from '@/pages/QuizResults/components/FilterSection';
import { QuizResultsTable } from '@/pages/QuizResults/components/QuizResultsTable';
import { useQuizResults } from '@/pages/QuizResults/hooks/useQuizResults';

export const QuizResults = () => {
    const list = useQuizResults();

    return (
        <section className="flex flex-col gap-5">
            <PageHeader title={strings.nav.quizResults} description={strings.quizResults.subtitle} />

            <FilterSection
                searchValue={list.search}
                quizId={list.quizId}
                quizTitle={list.quizTitle}
                employeeId={list.employeeId}
                employeeName={list.employeeName}
                status={list.status}
                hasFilters={list.hasFilters}
                disabled={list.state.status === 'loading'}
                onSearchSubmit={list.submitSearch}
                onSelectQuiz={list.selectQuiz}
                onSelectEmployee={list.selectEmployee}
                onSelectStatus={list.selectStatus}
                onClearFilters={list.clearFilters}
            />

            <QuizResultsTable
                state={list.state}
                lastPagination={list.lastPagination}
                page={list.page}
                pageSize={list.pageSize}
                hasFilters={list.hasFilters}
                onChangePage={list.goToPage}
                onChangeRowsPerPage={list.selectPageSize}
                onClearFilters={list.clearFilters}
                onRetry={list.retry}
            />
        </section>
    );
};

export default QuizResults;
