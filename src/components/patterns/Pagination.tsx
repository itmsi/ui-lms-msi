import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { strings } from '@/locales/id';
import type { ModulePagination } from '@/types/module';

interface PaginationProps {
    pagination: ModulePagination;
    onChangePage: (page: number) => void;
    disabled: boolean;
}

export const Pagination = ({ pagination, onChangePage, disabled }: PaginationProps) => {
    const { page, totalPages } = pagination;

    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav aria-label={strings.library.pagePrefix} className="flex items-center justify-between gap-3">
            <Button
                variant="secondary"
                size="sm"
                disabled={disabled || page <= 1}
                onClick={() => onChangePage(page - 1)}
                leadingIcon={<ChevronLeft aria-hidden="true" className="size-4" />}
            >
                {strings.library.previousPage}
            </Button>

            <p aria-live="polite" className="text-caption text-muted tabular-nums">
                {strings.library.pagePrefix} {page} {strings.library.pageSeparator} {totalPages}
            </p>

            <Button
                variant="secondary"
                size="sm"
                disabled={disabled || page >= totalPages}
                onClick={() => onChangePage(page + 1)}
                trailingIcon={<ChevronRight aria-hidden="true" className="size-4" />}
            >
                {strings.library.nextPage}
            </Button>
        </nav>
    );
};
