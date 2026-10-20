import { useAuth } from '@/hooks/useAuth';
import { useModuleList } from '@/hooks/useModuleList';
import type { ModuleListState } from '@/hooks/useModuleList';

export type MaterialsState = ModuleListState;

const PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export const useMaterials = () => {
    const { user } = useAuth();

    return useModuleList({ createdBy: user?.id ?? null, pageSize: PAGE_SIZE, pageSizeOptions: PAGE_SIZE_OPTIONS });
};
