import { BookOpen, SearchX } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import { ModuleRowList, ModuleRowListSkeleton } from '@/components/patterns/ModuleRowList';
import { Pagination } from '@/components/patterns/Pagination';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { strings } from '@/locales/id';
import type { MaterialsState } from '@/pages/Instructor/Materials/hooks/useMaterials';
import { materialDetailPath } from '@/pages/Instructor/Materials/utils/paths';

interface MaterialListProps {
    state: MaterialsState;
    pageSize: number;
    pageSizeOptions?: readonly number[];
    hasFilters: boolean;
    onChangePage: (page: number) => void;
    onChangePageSize: (pageSize: number) => void;
    onClearFilters: () => void;
    onRetry: () => void;
}

export const MaterialList = ({
    state,
    pageSize,
    pageSizeOptions,
    hasFilters,
    onChangePage,
    onChangePageSize,
    onClearFilters,
    onRetry,
}: MaterialListProps) => {
    const location = useLocation();

    if (state.status === 'loading') {
        return <ModuleRowListSkeleton count={pageSize} />;
    }

    if (state.status === 'error') {
        return (
            <Card>
                <ApiErrorState
                    code={state.code}
                    message={state.message}
                    unauthorizedTitle={strings.materials.unauthorizedTitle}
                    onRetry={onRetry}
                />
            </Card>
        );
    }

    if (state.result.items.length === 0) {
        return (
            <Card>
                <EmptyState
                    icon={hasFilters ? SearchX : BookOpen}
                    title={hasFilters ? strings.materials.filteredEmptyTitle : strings.materials.emptyTitle}
                    description={hasFilters ? strings.materials.filteredEmptyBody : strings.materials.emptyBody}
                    action={
                        hasFilters ? (
                            <Button variant="secondary" size="sm" onClick={onClearFilters}>
                                {strings.library.clearFilters}
                            </Button>
                        ) : undefined
                    }
                />
            </Card>
        );
    }

    return (
        <>
            <ModuleRowList materials={state.result.items} toBuilder={(id) => materialDetailPath(id, location.search)} />
            <Pagination
                pagination={state.result.pagination}
                onChangePage={onChangePage}
                disabled={false}
                itemLabel={strings.materials.itemsSuffix}
                pageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                onChangePageSize={onChangePageSize}
            />
        </>
    );
};
