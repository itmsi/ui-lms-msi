import { BookOpen, Plus, SearchX } from 'lucide-react';

import { ListToolbar } from '@/components/patterns/ListToolbar';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Pagination } from '@/components/patterns/Pagination';
import { SearchBar } from '@/components/patterns/SearchBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LinkButton } from '@/components/ui/LinkButton';
import { useMaterialsAccess } from '@/hooks/useMaterialsAccess';
import { strings } from '@/locales/id';
import { MaterialList, MaterialListSkeleton } from '@/pages/Instructor/Materials/components/MaterialList';
import { useMaterials } from '@/pages/Instructor/Materials/hooks/useMaterials';
import type { MaterialsState } from '@/pages/Instructor/Materials/hooks/useMaterials';

const renderError = (state: Extract<MaterialsState, { status: 'error' }>, onRetry: () => void) => {
    if (state.code === 'unauthorized') {
        return (
            <ErrorState
                title={strings.materials.unauthorizedTitle}
                whatHappened={strings.apiErrors.unauthorizedHappened}
                whatYouCanDo={strings.apiErrors.unauthorizedDo}
                whatIsNext={strings.apiErrors.unauthorizedNext}
            />
        );
    }

    if (state.code === 'offline') {
        return (
            <ErrorState
                whatHappened={strings.apiErrors.offlineHappened}
                whatYouCanDo={strings.apiErrors.offlineDo}
                whatIsNext={strings.apiErrors.offlineNext}
                onRetry={onRetry}
            />
        );
    }

    if (state.code === 'validation' && state.message !== undefined) {
        return (
            <ErrorState
                whatHappened={state.message}
                whatYouCanDo={strings.apiErrors.validationDo}
                whatIsNext={strings.apiErrors.validationNext}
                onRetry={onRetry}
            />
        );
    }

    return <ErrorState onRetry={onRetry} />;
};

export const Materials = () => {
    const { state, search, sort, submitSearch, selectSort, clearFilters, goToPage, retry, hasFilters, pageSize } =
        useMaterials();
    const { canCreate } = useMaterialsAccess();

    const isLoading = state.status === 'loading';
    const total = state.status === 'success' ? state.result.pagination.total : null;
    const isEmpty = state.status === 'success' && state.result.items.length === 0;

    return (
        <section className="flex flex-col gap-5">
            <PageHeader title={strings.nav.materials} description={strings.materials.subtitle} />

            <SearchBar
                label={strings.materials.searchLabel}
                placeholder={strings.materials.searchPlaceholder}
                value={search}
                onSubmit={submitSearch}
                hasFilters={hasFilters}
                onClear={clearFilters}
                disabled={isLoading}
            />

            <ListToolbar
                title={hasFilters ? strings.materials.sectionTitleSearch : strings.materials.sectionTitle}
                total={total}
                sort={sort}
                onSelectSort={selectSort}
                disabled={isLoading}
                action={
                    canCreate ? (
                        <LinkButton
                            to="/materials/new"
                            size="sm"
                            leadingIcon={<Plus aria-hidden="true" className="size-4" />}
                        >
                            {strings.materials.createAction}
                        </LinkButton>
                    ) : undefined
                }
            />

            {isLoading ? <MaterialListSkeleton count={pageSize} /> : null}

            {state.status === 'error' ? <Card>{renderError(state, retry)}</Card> : null}

            {isEmpty ? (
                <Card>
                    <EmptyState
                        icon={hasFilters ? SearchX : BookOpen}
                        title={hasFilters ? strings.materials.filteredEmptyTitle : strings.materials.emptyTitle}
                        description={hasFilters ? strings.materials.filteredEmptyBody : strings.materials.emptyBody}
                        action={
                            hasFilters ? (
                                <Button variant="secondary" size="sm" onClick={clearFilters}>
                                    {strings.library.clearFilters}
                                </Button>
                            ) : undefined
                        }
                    />
                </Card>
            ) : null}

            {state.status === 'success' && state.result.items.length > 0 ? (
                <>
                    <MaterialList materials={state.result.items} />
                    <Pagination pagination={state.result.pagination} onChangePage={goToPage} disabled={isLoading} />
                </>
            ) : null}
        </section>
    );
};

export default Materials;
