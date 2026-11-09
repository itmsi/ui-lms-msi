import { usePagedSearch } from '@/hooks/usePagedSearch';
import type { PagedSearchFetcher } from '@/hooks/usePagedSearch';
import { fetchQuizOptions } from '@/services/quizOptionService';
import type { QuizOption } from '@/types/quiz';

const searchQuizzes: PagedSearchFetcher<QuizOption> = async (params, signal) => {
    const outcome = await fetchQuizOptions(params, signal);

    return outcome.ok ? outcome : { ...outcome, code: outcome.code === 'not_found' ? 'unknown' : outcome.code };
};

export const useQuizSearch = (term: string, enabled: boolean, onLoaded?: (items: QuizOption[]) => void) =>
    usePagedSearch(searchQuizzes, term, enabled, onLoaded);
