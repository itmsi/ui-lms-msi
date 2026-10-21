import { usePagedSearch } from '@/hooks/usePagedSearch';
import type { PagedSearchFetcher } from '@/hooks/usePagedSearch';
import { fetchModules } from '@/services/moduleService';
import type { LearningModule } from '@/types/module';

const searchModules: PagedSearchFetcher<LearningModule> = (params, signal) =>
    fetchModules({ ...params, sort: 'latest', category: null, createdBy: null }, signal);

export const useModuleSearch = (term: string, enabled: boolean, onLoaded?: (items: LearningModule[]) => void) =>
    usePagedSearch(searchModules, term, enabled, onLoaded);
