import { FilterSection } from '@/pages/Candidate/Library/components/FilterSection';
import { LibraryList } from '@/pages/Candidate/Library/components/LibraryList';
import { useLibrary } from '@/pages/Candidate/Library/hooks/useLibrary';

export const Library = () => {
    const list = useLibrary();

    return (
        <section className="flex flex-col gap-5">
            <FilterSection
                searchValue={list.search}
                sort={list.sort}
                total={list.state.status === 'success' ? list.state.result.pagination.total : null}
                canFilterCategory={list.canFilterCategory}
                categoryFilter={list.categoryFilter}
                hasFilters={list.hasFilters}
                disabled={list.state.status === 'loading'}
                onSearchSubmit={list.submitSearch}
                onSelectSort={list.selectSort}
                onSelectCategoryFilter={list.selectCategoryFilter}
                onClearFilters={list.clearFilters}
            />

            <LibraryList
                state={list.state}
                pageSize={list.pageSize}
                hasFilters={list.hasFilters}
                onChangePage={list.goToPage}
                onClearFilters={list.clearFilters}
                onRetry={list.retry}
            />
        </section>
    );
};

export default Library;
