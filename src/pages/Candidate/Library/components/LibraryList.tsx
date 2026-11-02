import { LibraryBig, SearchX } from 'lucide-react';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import { ModuleThumbnailGrid, ModuleThumbnailGridSkeleton } from '@/components/patterns/ModuleThumbnailGrid';
import { Pagination } from '@/components/patterns/Pagination';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { WoodPanel } from '@/components/ui/WoodPanel';
import { strings } from '@/locales/id';
import type { LibraryState } from '@/pages/Candidate/Library/hooks/useLibrary';

interface LibraryListProps {
    state: LibraryState;
    pageSize: number;
    hasFilters: boolean;
    onChangePage: (page: number) => void;
    onClearFilters: () => void;
    onRetry: () => void;
}

export const LibraryList = ({ state, pageSize, hasFilters, onChangePage, onClearFilters, onRetry }: LibraryListProps) => (
    <>
        <WoodPanel className="flex flex-col gap-3">
            {state.status === 'loading' ? <ModuleThumbnailGridSkeleton count={pageSize} /> : null}

            {state.status === 'error' ? (
                <Card>
                    <ApiErrorState
                        code={state.code}
                        message={state.message}
                        unauthorizedTitle={strings.library.unauthorizedTitle}
                        onRetry={onRetry}
                    />
                </Card>
            ) : null}

            {state.status === 'success' && state.result.items.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={hasFilters ? SearchX : LibraryBig}
                        title={hasFilters ? strings.library.filteredEmptyTitle : strings.library.emptyTitle}
                        description={hasFilters ? strings.library.filteredEmptyBody : strings.library.emptyBody}
                        action={
                            hasFilters ? (
                                <Button variant="secondary" size="sm" onClick={onClearFilters}>
                                    {strings.library.clearFilters}
                                </Button>
                            ) : undefined
                        }
                    />
                </Card>
            ) : null}

            {state.status === 'success' && state.result.items.length > 0 ? (
                <ModuleThumbnailGrid materials={state.result.items} toBuilder={(id) => `/library/${id}`} />
            ) : null}
        </WoodPanel>

        {state.status === 'success' && state.result.items.length > 0 ? (
            <Pagination pagination={state.result.pagination} onChangePage={onChangePage} disabled={false} />
        ) : null}
    </>
);
