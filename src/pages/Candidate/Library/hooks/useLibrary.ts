import { useAuth } from '@/hooks/useAuth';
import { useModuleList } from '@/hooks/useModuleList';
import type { ModuleListState } from '@/hooks/useModuleList';
import type { CandidateProgram } from '@/types/user';

export type LibraryState = ModuleListState;

const PAGE_SIZE = 12;

const CATEGORY_BY_PROGRAM: Record<CandidateProgram, string> = {
    mt: 'mt',
    regular: 'reguler',
};

export type LibraryCategoryFilter = 'all' | 'reguler' | 'mt';

const FILTER_CATEGORIES = [CATEGORY_BY_PROGRAM.regular, CATEGORY_BY_PROGRAM.mt] as const;

export const useLibrary = () => {
    const { user } = useAuth();
    const program = user?.program ?? null;
    const canFilterCategory = program === 'regular' || program === null;

    const list = useModuleList({
        createdBy: null,
        pageSize: PAGE_SIZE,
        ...(canFilterCategory
            ? { categoryOptions: FILTER_CATEGORIES }
            : { fixedCategory: program === null ? null : CATEGORY_BY_PROGRAM[program] }),
    });

    const categoryFilter: LibraryCategoryFilter =
        list.category === 'reguler' || list.category === 'mt' ? list.category : 'all';

    return {
        ...list,
        canFilterCategory,
        categoryFilter,
        selectCategoryFilter: (next: LibraryCategoryFilter) => list.selectCategory(next === 'all' ? null : next),
    };
};