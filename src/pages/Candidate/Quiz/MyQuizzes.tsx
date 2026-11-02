import { PageHeader } from '@/components/patterns/PageHeader';
import { strings } from '@/locales/id';
import { FilterSection } from '@/pages/Candidate/Quiz/components/FilterSection';
import { MyQuizList } from '@/pages/Candidate/Quiz/components/MyQuizList';
import { useMyQuizzes } from '@/pages/Candidate/Quiz/hooks/useMyQuizzes';

export const MyQuizzes = () => {
    const { state, retry, quizzes, search, moduleId, moduleTitle, hasFilters, submitSearch, selectModule, clearFilters, goToPage } =
        useMyQuizzes();

    return (
        <section className="flex flex-col gap-5">
            <PageHeader title={strings.nav.myQuiz} description={strings.myQuiz.subtitle} />

            <FilterSection
                searchValue={search}
                moduleId={moduleId}
                moduleTitle={moduleTitle}
                hasFilters={hasFilters}
                disabled={state.status === 'loading'}
                onSearchSubmit={submitSearch}
                onSelectModule={selectModule}
                onClearFilters={clearFilters}
            />

            <MyQuizList
                state={state}
                quizzes={quizzes}
                hasFilters={hasFilters}
                onClearFilters={clearFilters}
                onRetry={retry}
                onChangePage={goToPage}
            />
        </section>
    );
};

export default MyQuizzes;
