import { readEnvelope } from '@/helpers/apiEnvelope';
import { isRecord } from '@/helpers/authParsers';
import { toApiFailureCode, toPagination } from '@/services/moduleService';
import { mockQuizResultRequest } from '@/services/mocks/quizResultMock';
import { toQuestionReview } from '@/services/quizService';
import type { QuizOutcome } from '@/types/quiz';
import type {
    GradingAttempt,
    GradingPoints,
    GradingReview,
    QuizOption,
    QuizResultListResult,
    QuizResultQuery,
    QuizResultRow,
} from '@/types/quizResult';

const QUIZ_LIST_PATH = 'quizzes/get';
const LIST_PATH = 'quiz-results/get';
const detailPath = (id: string) => `quiz-results/get/${encodeURIComponent(id)}`;
const updatePath = (id: string) => `quiz-results/update/${encodeURIComponent(id)}`;

const QUIZ_OPTIONS_LIMIT = 100;

const readString = (value: unknown): string => (typeof value === 'string' ? value : '');

const readNumber = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null);

const toRow = (value: unknown): QuizResultRow | null => {
    if (isRecord(value) === false || typeof value.id !== 'string' || typeof value.employee_id !== 'string') {
        return null;
    }

    const isCompleted = value.status === 'completed' && typeof value.attempt_id === 'string';

    return {
        id: value.id,
        employeeId: value.employee_id,
        employeeName: readString(value.employee_name),
        quizId: readString(value.quizzes_id),
        quizTitle: readString(value.quiz_title),
        moduleTitle: readString(value.module_title),
        status: isCompleted ? 'completed' : 'not_completed',
        attemptId: isCompleted && typeof value.attempt_id === 'string' ? value.attempt_id : null,
        score: isCompleted ? readNumber(value.score) : null,
        maxScore: readNumber(value.max_score) ?? 0,
        submittedAt: isCompleted && typeof value.submitted_at === 'string' ? value.submitted_at : null,
        isAdjusted: value.is_adjusted === true,
        adjustedAt: typeof value.adjusted_at === 'string' && value.adjusted_at !== '' ? value.adjusted_at : null,
        adjustedByName: typeof value.adjusted_by_name === 'string' && value.adjusted_by_name !== '' ? value.adjusted_by_name : null,
    };
};

const toListResult =
    (query: QuizResultQuery) =>
    (data: unknown): QuizResultListResult | null =>
        isRecord(data) && Array.isArray(data.items)
            ? {
                  items: (data.items as unknown[]).map(toRow).filter((item): item is QuizResultRow => item !== null),
                  pagination: toPagination(data.pagination, { page: query.page, limit: query.limit }),
              }
            : null;

const toQuizOptions = (data: unknown): QuizOption[] | null =>
    isRecord(data) && Array.isArray(data.items)
        ? (data.items as unknown[]).flatMap((item) =>
              isRecord(item) && typeof item.id === 'string' ? [{ id: item.id, title: readString(item.title) }] : [],
          )
        : null;

const toGradingReview = (value: unknown): GradingReview | null => {
    const review = toQuestionReview(value);

    if (review === null || isRecord(value) === false) {
        return null;
    }

    return { ...review, autoPointsEarned: readNumber(value.auto_points_earned) ?? review.pointsEarned };
};

const toGradingAttempt = (value: unknown): GradingAttempt | null => {
    if (isRecord(value) === false || typeof value.id !== 'string') {
        return null;
    }

    return {
        id: value.id,
        quizId: readString(value.quizzes_id),
        quizTitle: readString(value.quiz_title),
        moduleTitle: readString(value.module_title),
        employeeId: readString(value.employee_id),
        employeeName: readString(value.employee_name),
        submittedAt: readString(value.submitted_at),
        score: readNumber(value.score) ?? 0,
        maxScore: readNumber(value.max_score) ?? 0,
        correctCount: readNumber(value.correct_count) ?? 0,
        questionCount: readNumber(value.question_count) ?? 0,
        adjustedAt: typeof value.adjusted_at === 'string' && value.adjusted_at !== '' ? value.adjusted_at : null,
        adjustedByName: typeof value.adjusted_by_name === 'string' && value.adjusted_by_name !== '' ? value.adjusted_by_name : null,
        review: Array.isArray(value.review)
            ? (value.review as unknown[])
                  .map(toGradingReview)
                  .filter((item): item is GradingReview => item !== null)
                  .sort((left, right) => left.line - right.line)
            : [],
    };
};

const request = async <T>(
    path: string,
    parse: (data: unknown) => T | null,
    payload?: unknown,
    signal?: AbortSignal,
): Promise<QuizOutcome<T>> => {
    if (navigator.onLine === false) {
        return { ok: false, code: 'offline' };
    }

    try {
        const { data: body } = await mockQuizResultRequest(path, payload, signal);
        const envelope = readEnvelope(body);

        if (envelope.ok === false) {
            return envelope.message === null
                ? { ok: false, code: 'unknown' }
                : { ok: false, code: 'validation', message: envelope.message };
        }

        const parsed = parse(envelope.data);

        return parsed === null ? { ok: false, code: 'not_found' } : { ok: true, data: parsed };
    } catch (error) {
        const status = isRecord(error) && typeof error.status === 'number' ? error.status : null;

        return status === 404 ? { ok: false, code: 'not_found' } : { ok: false, code: toApiFailureCode(error) };
    }
};

export const fetchQuizResults = (query: QuizResultQuery, signal?: AbortSignal) =>
    request(
        LIST_PATH,
        toListResult(query),
        {
            page: query.page,
            limit: query.limit,
            search: query.search,
            quizzes_id: query.quizId ?? '',
            status: query.status === 'all' ? '' : query.status,
        },
        signal,
    );

export const fetchQuizOptions = (signal?: AbortSignal) =>
    request(
        QUIZ_LIST_PATH,
        toQuizOptions,
        { page: 1, limit: QUIZ_OPTIONS_LIMIT, search: '', sort_by: 'created_at', sort_order: 'desc' },
        signal,
    );

export const fetchGradingAttempt = (id: string, signal?: AbortSignal) => request(detailPath(id), toGradingAttempt, undefined, signal);

export const saveGradingPoints = (id: string, points: GradingPoints) =>
    request(updatePath(id), toGradingAttempt, {
        points: Object.entries(points).map(([questionId, value]) => ({ quiz_questions_id: questionId, points_earned: value })),
    });
