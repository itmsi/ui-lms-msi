import { LibraryBig, SearchX } from 'lucide-react';

import { ListToolbar } from '@/components/patterns/ListToolbar';
import { Pagination } from '@/components/patterns/Pagination';
import { SearchBar } from '@/components/patterns/SearchBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { SegmentedOption } from '@/components/ui/SegmentedControl';
import { strings } from '@/locales/id';
import { MaterialGrid, MaterialGridSkeleton } from '@/pages/Candidate/Library/components/MaterialGrid';
import { useLibrary } from '@/pages/Candidate/Library/hooks/useLibrary';
import type { LibraryCategoryFilter, LibraryState } from '@/pages/Candidate/Library/hooks/useLibrary';

const renderError = (state: Extract<LibraryState, { status: 'error' }>, onRetry: () => void) => {
    if (state.code === 'unauthorized') {
        return (
            <ErrorState
                title={strings.library.unauthorizedTitle}
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

const CATEGORY_FILTER_OPTIONS: SegmentedOption<LibraryCategoryFilter>[] = [
    { value: 'all', label: strings.library.categoryAll },
    { value: 'reguler', label: strings.library.categoryRegular },
    { value: 'mt', label: strings.library.categoryMt },
];

export const Library = () => {
    const {
        state,
        search,
        sort,
        submitSearch,
        selectSort,
        clearFilters,
        goToPage,
        retry,
        hasFilters,
        pageSize,
        canFilterCategory,
        categoryFilter,
        selectCategoryFilter,
    } = useLibrary();

    const isLoading = state.status === 'loading';
    const total = state.status === 'success' ? state.result.pagination.total : null;
    const isEmpty = state.status === 'success' && state.result.items.length === 0;

    return (
        <section className="flex flex-col gap-5">

            <SearchBar
                label={strings.library.searchLabel}
                placeholder={strings.library.searchPlaceholder}
                value={search}
                onSubmit={submitSearch}
                hasFilters={hasFilters}
                onClear={clearFilters}
                disabled={isLoading}
            />

            <ListToolbar
                title={search === '' ? strings.library.sectionTitle : strings.library.sectionTitleSearch}
                total={total}
                sort={sort}
                onSelectSort={selectSort}
                disabled={isLoading}
                filter={
                    canFilterCategory ? (
                        <SegmentedControl
                            label={strings.library.categoryLabel}
                            options={CATEGORY_FILTER_OPTIONS}
                            value={categoryFilter}
                            onChange={selectCategoryFilter}
                            disabled={isLoading}
                        />
                    ) : undefined
                }
            />

            {isLoading ? <MaterialGridSkeleton count={pageSize} /> : null}

            {state.status === 'error' ? <Card>{renderError(state, retry)}</Card> : null}

            {isEmpty ? (
                <Card>
                    <EmptyState
                        icon={hasFilters ? SearchX : LibraryBig}
                        title={hasFilters ? strings.library.filteredEmptyTitle : strings.library.emptyTitle}
                        description={hasFilters ? strings.library.filteredEmptyBody : strings.library.emptyBody}
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
                    <MaterialGrid materials={state.result.items} />
                    <Pagination
                        pagination={state.result.pagination}
                        onChangePage={goToPage}
                        disabled={isLoading}
                    />
                </>
            ) : null}
        </section>
    );
};

export default Library;
