import { useMaterialsAccess } from '@/hooks/useMaterialsAccess';
import { FilterSection } from '@/pages/Instructor/Materials/components/FilterSection';
import { MaterialList } from '@/pages/Instructor/Materials/components/MaterialList';
import { useMaterials } from '@/pages/Instructor/Materials/hooks/useMaterials';

export const Materials = () => {
    const list = useMaterials();
    const { canCreate } = useMaterialsAccess();

    return (
        <section className="flex flex-col gap-5">
            <FilterSection
                searchValue={list.search}
                sort={list.sort}
                total={list.state.status === 'success' ? list.state.result.pagination.total : null}
                hasFilters={list.hasFilters}
                disabled={list.state.status === 'loading'}
                canCreate={canCreate}
                onSearchSubmit={list.submitSearch}
                onSelectSort={list.selectSort}
                onClearFilters={list.clearFilters}
            />

            <MaterialList
                state={list.state}
                pageSize={list.pageSize}
                pageSizeOptions={list.pageSizeOptions}
                hasFilters={list.hasFilters}
                onChangePage={list.goToPage}
                onChangePageSize={list.selectPageSize}
                onClearFilters={list.clearFilters}
                onRetry={list.retry}
            />
        </section>
    );
};

export default Materials;
