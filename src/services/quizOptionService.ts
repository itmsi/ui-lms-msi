import { toPagination } from '@/helpers/apiEnvelope';
import { apiPost } from '@/helpers/apiHelper';
import { isRecord } from '@/helpers/authParsers';
import { send } from '@/services/quizRequest';
import type { QuizOption, QuizOptionListResult, QuizOptionQuery } from '@/types/quiz';

const LIST_PATH = 'quizzes/get';

const toOption = (value: unknown): QuizOption | null =>
    isRecord(value) && typeof value.id === 'string'
        ? {
              id: value.id,
              title: typeof value.title === 'string' ? value.title : '',
              moduleTitle: typeof value.module_title === 'string' && value.module_title !== '' ? value.module_title : null,
          }
        : null;

const toListResult =
    (query: QuizOptionQuery) =>
    (data: unknown): QuizOptionListResult | null =>
        isRecord(data) && Array.isArray(data.items)
            ? {
                  items: (data.items as unknown[]).map(toOption).filter((item): item is QuizOption => item !== null),
                  pagination: toPagination(data.pagination, { page: query.page, limit: query.limit }),
              }
            : null;

export const fetchQuizOptions = (query: QuizOptionQuery, signal?: AbortSignal) =>
    send(
        () =>
            apiPost<unknown>(
                LIST_PATH,
                { page: query.page, limit: query.limit, search: query.search, sort_by: 'created_at', sort_order: 'desc' },
                { signal },
            ),
        toListResult(query),
    );
