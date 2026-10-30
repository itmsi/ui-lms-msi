import { ClipboardList, Plus, SearchX } from 'lucide-react';
import { useCallback } from 'react';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import { MateriSelect } from '@/components/patterns/MateriSelect';
import { PageHeader } from '@/components/patterns/PageHeader';
import { SearchBar } from '@/components/patterns/SearchBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LinkButton } from '@/components/ui/LinkButton';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { SegmentedOption } from '@/components/ui/SegmentedControl';
import { useMaterialSelection } from '@/hooks/useMaterialSelection';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { useNow } from '@/hooks/useNow';
import { strings } from '@/locales/id';
import { QuizListTable } from '@/pages/QuizMaterials/components/QuizListTable';
import { useQuizDeletion } from '@/pages/QuizMaterials/hooks/useQuizDeletion';
import { useQuizList } from '@/pages/QuizMaterials/hooks/useQuizList';
import { QUIZ_CREATE_PATH } from '@/pages/QuizMaterials/utils/paths';
import type { QuizAudienceFilter } from '@/pages/QuizMaterials/types';
import { toIsoDate } from '@/utils/dateTime';

const NOW_TICK_MS = 60_000;

const AUDIENCE_OPTIONS: SegmentedOption<QuizAudienceFilter>[] = [
    { value: 'all', label: strings.quizMaterials.audienceAll },
    { value: 'reguler', label: strings.quizForm.audience.reguler },
    { value: 'mt', label: strings.quizForm.audience.mt },
];

const CreateButton = () => (
    <LinkButton to={QUIZ_CREATE_PATH} size="sm" leadingIcon={<Plus aria-hidden="true" className="size-4" />}>
        {strings.quizMaterials.createAction}
    </LinkButton>
);

export const QuizMaterials = () => {
    const today = toIsoDate(new Date(useNow(NOW_TICK_MS)));
    const {
        state,
        lastPagination,
        page,
        pageSize,
        search,
        moduleId,
        audience,
        hasFilters,
        submitSearch,
        selectModule,
        selectAudience,
        clearFilters,
        goToPage,
        selectPageSize,
        retry,
    } = useQuizList();
    const { selectedMaterial, rememberMaterials, selectMaterial } = useMaterialSelection(moduleId, selectModule);
    const { canCreate, canDelete } = useMenuAccess('quizMaterials');

    const isLoading = state.status === 'loading';
    const items = state.status === 'success' ? state.result.items : [];
    const isLastOnPage = items.length === 1 && page > 1;

    const reloadAfterDelete = useCallback(() => {
        if (isLastOnPage) {
            goToPage(page - 1);
            return;
        }

        retry();
    }, [goToPage, isLastOnPage, page, retry]);

    const deletion = useQuizDeletion(reloadAfterDelete);
    const moduleFallback = moduleId === null ? null : (items.find((item) => item.moduleId === moduleId)?.moduleTitle ?? null);

    return (
        <section className="flex flex-col gap-5">
            <PageHeader
                title={strings.nav.quizMaterials}
                description={strings.quizMaterials.subtitle}
                actions={canCreate ? <CreateButton /> : undefined}
            />

            <div className="flex flex-col gap-3">
                <SearchBar
                    label={strings.quizMaterials.searchLabel}
                    placeholder={strings.quizMaterials.searchPlaceholder}
                    value={search}
                    onSubmit={submitSearch}
                    hasFilters={hasFilters}
                    onClear={clearFilters}
                    disabled={isLoading}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex flex-col gap-1.5 sm:w-96">
                        <span aria-hidden="true" className="text-body text-ink font-medium">
                            {strings.quizMaterials.moduleFilterLabel}
                        </span>
                        <MateriSelect
                            value={moduleId}
                            selected={selectedMaterial}
                            onChange={selectMaterial}
                            onMaterialsLoaded={rememberMaterials}
                            fallbackLabel={moduleFallback}
                            label={strings.quizMaterials.moduleFilterLabel}
                            placeholder={strings.quizMaterials.moduleFilterPlaceholder}
                        />
                    </div>
                    <SegmentedControl
                        label={strings.quizMaterials.audienceFilterLabel}
                        showlabel
                        options={AUDIENCE_OPTIONS}
                        value={audience}
                        onChange={selectAudience}
                        disabled={isLoading}
                    />
                </div>
            </div>

            {state.status === 'error' ? (
                <Card>
                    <ApiErrorState
                        code={state.code === 'not_found' ? 'unknown' : state.code}
                        message={state.message}
                        unauthorizedTitle={strings.quizMaterials.unauthorizedTitle}
                        onRetry={retry}
                    />
                </Card>
            ) : (
                <QuizListTable
                    items={items}
                    today={today}
                    loading={isLoading}
                    pagination={state.status === 'success' ? state.result.pagination : lastPagination}
                    page={page}
                    pageSize={pageSize}
                    onChangePage={goToPage}
                    onChangeRowsPerPage={selectPageSize}
                    emptyIcon={hasFilters ? SearchX : ClipboardList}
                    emptyTitle={hasFilters ? strings.quizMaterials.filteredEmptyTitle : strings.quizMaterials.emptyTitle}
                    emptyDescription={hasFilters ? strings.quizMaterials.filteredEmptyBody : strings.quizMaterials.emptyBody}
                    emptyAction={
                        hasFilters ? (
                            <Button variant="secondary" size="sm" onClick={clearFilters}>
                                {strings.quizMaterials.clearFilters}
                            </Button>
                        ) : canCreate ? (
                            <CreateButton />
                        ) : undefined
                    }
                    onDelete={canDelete ? deletion.request : null}
                />
            )}

            <ConfirmDialog
                open={deletion.pending !== null}
                title={strings.quizMaterials.deleteTitle}
                description={`${strings.quizMaterials.deleteBodyPrefix} "${deletion.pending?.title ?? ''}" ${strings.quizMaterials.deleteBodySuffix}`}
                confirmLabel={strings.quizMaterials.deleteConfirm}
                cancelLabel={strings.quizMaterials.deleteCancel}
                isConfirming={deletion.isDeleting}
                confirmingLabel={strings.quizMaterials.deleting}
                onConfirm={() => void deletion.confirm()}
                onCancel={deletion.cancel}
            />
        </section>
    );
};

export default QuizMaterials;
