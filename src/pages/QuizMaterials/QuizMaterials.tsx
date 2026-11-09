import { PageHeader } from '@/components/patterns/PageHeader';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { strings } from '@/locales/id';
import { FilterSection } from '@/pages/QuizMaterials/components/FilterSection';
import { QuizCreateButton } from '@/pages/QuizMaterials/components/QuizCreateButton';
import { QuizDeleteDialog } from '@/pages/QuizMaterials/components/QuizDeleteDialog';
import { QuizListTable } from '@/pages/QuizMaterials/components/QuizListTable';
import { useQuizDeletion } from '@/pages/QuizMaterials/hooks/useQuizDeletion';
import { useQuizList } from '@/pages/QuizMaterials/hooks/useQuizList';

export const QuizMaterials = () => {
    const list = useQuizList();
    const { canCreate, canDelete } = useMenuAccess('quizMaterials');
    const deletion = useQuizDeletion(list.reloadAfterDelete);

    return (
        <section className="flex flex-col gap-5">
            <PageHeader
                title={strings.nav.quizMaterials}
                description={strings.quizMaterials.subtitle}
                actions={canCreate ? <QuizCreateButton /> : undefined}
            />

            <FilterSection
                searchValue={list.search}
                moduleId={list.moduleId}
                moduleTitle={list.moduleTitle}
                audience={list.audience}
                hasFilters={list.hasFilters}
                disabled={list.state.status === 'loading'}
                onSearchSubmit={list.submitSearch}
                onSelectModule={list.selectModule}
                onSelectAudience={list.selectAudience}
                onClearFilters={list.clearFilters}
            />

            <QuizListTable
                state={list.state}
                lastPagination={list.lastPagination}
                page={list.page}
                pageSize={list.pageSize}
                hasFilters={list.hasFilters}
                canCreate={canCreate}
                onChangePage={list.goToPage}
                onChangeRowsPerPage={list.selectPageSize}
                onClearFilters={list.clearFilters}
                onRetry={list.retry}
                onDelete={canDelete ? deletion.request : null}
            />

            <QuizDeleteDialog
                quiz={deletion.pending}
                isDeleting={deletion.isDeleting}
                onConfirm={() => void deletion.confirm()}
                onCancel={deletion.cancel}
            />
        </section>
    );
};

export default QuizMaterials;
