import { apiGet, apiPost, apiPut } from '@/helpers/apiHelper';
import { isRecord } from '@/helpers/authParsers';
import { strings } from '@/locales/id';
import { toPagination } from '@/services/moduleService';
import { send, toQuestionReview } from '@/services/quizService';
import type { ParticipantQuestionType, SubmittedAttachment } from '@/types/quiz';
import type {
    GradingAttempt,
    GradingPoints,
    GradingReview,
    QuizResultListResult,
    QuizResultQuery,
    QuizResultRow,
} from '@/types/quizResult';
import { toHttpsUrl } from '@/utils/httpsUrl';

const LIST_PATH = '/quiz_results/get';
const detailPath = (id: string) => `quiz_results/${encodeURIComponent(id)}`;
const updatePath = (id: string) => `quiz_results/${encodeURIComponent(id)}`;

const readString = (value: unknown): string => (typeof value === 'string' ? value : '');

const readNumber = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null);

const readNumeric = (value: unknown): number | null =>
    readNumber(typeof value === 'string' && value.trim() !== '' ? Number(value) : value);

const QUESTION_TYPES: readonly ParticipantQuestionType[] = ['multiple_choice', 'multiple_answers', 'true_false', 'short_answer'];

const isQuestionType = (value: unknown): value is ParticipantQuestionType =>
    QUESTION_TYPES.some((type) => type === value);

const readAnswerTexts = (value: unknown): string[] =>
    Array.isArray(value)
        ? (value as unknown[]).flatMap((item) => (isRecord(item) ? [readString(item.text)] : []))
        : [];

const toGradingAttachments = (value: unknown): SubmittedAttachment[] => {
    const url = toHttpsUrl(value);

    return url === null ? [] : [{ name: strings.myQuiz.savedFileLink, size: null, url }];
};

const toRow = (value: unknown): QuizResultRow | null => {
    if (isRecord(value) === false) {
        return null;
    }

    const isCompleted = value.status === 'completed';

    return {
        employeeName: readString(value.created_by_name),
        quizId: readString(value.quiz_result_id),
        quizTitle: readString(value.quizze_title),
        moduleTitle: readString(value.module_title),
        status: isCompleted ? 'completed' : 'not_completed',
        score: isCompleted ? readNumber(Number(value.total_point)) : null,
        maxScore: readNumber(Number(value.max_points)) ?? 0,
        submittedAt: isCompleted && typeof value.send_date === 'string' ? value.send_date : null,
        isAdjusted: value.is_adjusted === true,
        adjustedAt: typeof value.updated_at === 'string' && value.updated_at !== '' ? value.updated_at : null,
        adjustedByName: typeof value.updated_by_name === 'string' && value.updated_by_name !== '' ? value.updated_by_name : null,
    };
};

const toListResult =
    (query: QuizResultQuery) =>
        (data: unknown): QuizResultListResult | null => {
            if (!isRecord(data) || !Array.isArray(data.items)) {
                return null;
            }

            return {
                items: (data.items as unknown[])
                    .map(toRow)
                    .filter((item): item is QuizResultRow => item !== null),
                pagination: toPagination(data.pagination, {
                    page: query.page,
                    limit: query.limit,
                }),
            };
        };

const toGradingReview = (value: unknown): GradingReview | null => {
    const review = toQuestionReview(value);

    if (review === null || isRecord(value) === false || typeof value.quiz_answer_id !== 'string') {
        return null;
    }
    return {
        ...review,
        quizAnswerId: value.quiz_answer_id,
        autoPointsEarned: readNumeric(value.auto_points_earned) ?? review.pointsEarned,
    };
};

const toApiGradingReview = (value: unknown): GradingReview | null => {
    if (
        isRecord(value) === false ||
        typeof value.quiz_question_id !== 'string' ||
        typeof value.quiz_answer_id !== 'string' ||
        isQuestionType(value.type) === false
    ) {
        return null;
    }

    const pointsEarned = readNumeric(value.user_point) ?? 0;
    return {
        questionId: value.quiz_question_id,
        quizAnswerId: value.quiz_answer_id,
        line: readNumeric(value.line) ?? 0,
        type: value.type,
        text: readString(value.question),
        imageUrl: toHttpsUrl(value.question_file) + '/preview',
        yourAnswer: readAnswerTexts(value.user_answer),
        yourAttachments: toGradingAttachments(value.user_answer_file),
        correctAnswer: readAnswerTexts(value.question_answer),
        isCorrect: value.answer_status === 'correct',
        pointsEarned,
        points: readNumeric(value.question_point) ?? 0,
        autoPointsEarned: pointsEarned,
    };
};

const toGradingAttempt = (value: unknown): GradingAttempt | null => {
    if (isRecord(value) === false) {
        return null;
    }

    const id = readString(value.id) || readString(value.quiz_result_id);

    if (id === '') {
        return null;
    }

    const review = Array.isArray(value.question_answers)
        ? (value.question_answers as unknown[])
            .map(toApiGradingReview)
            .filter((item): item is GradingReview => item !== null)
            .sort((left, right) => left.line - right.line)
        : Array.isArray(value.review)
            ? (value.review as unknown[])
                .map(toGradingReview)
                .filter((item): item is GradingReview => item !== null)
                .sort((left, right) => left.line - right.line)
            : [];

    return {
        id,
        quizId: readString(value.quiz_id) || readString(value.quiz_result_id),
        quizTitle: readString(value.quizze_title),
        moduleTitle: readString(value.module_title),
        employeeName: readString(value.created_by_name),
        submittedAt: readString(value.send_date),
        score: readNumeric(value.total_point) ?? 0,
        maxScore: readNumeric(value.max_points) ?? readNumeric(value.total_possible_points) ?? 0,
        correctCount: review.filter((item) => item.isCorrect).length,
        questionCount: review.length || (readNumeric(value.question_count) ?? 0),
        adjustedAt: typeof value.updated_at === 'string' && value.updated_at !== '' ? value.updated_at : null,
        adjustedByName: typeof value.updated_by_name === 'string' && value.updated_by_name !== ''
            ? value.updated_by_name
            : typeof value.adjusted_by_name === 'string' && value.adjusted_by_name !== ''
                ? value.adjusted_by_name
                : null,
        review,
    };
};

export const fetchQuizResults = (query: QuizResultQuery, signal?: AbortSignal) =>
    send(
        async () => {
            const payload = {
                page: query.page,
                limit: query.limit,
                search: query.search,
                quizzes_id: query.quizId ?? '',
                status: query.status === 'all' ? '' : query.status,
                ...(query.employeeId === null ? {} : { employee_id: query.employeeId }),
            };

            const response = await apiPost<unknown>(
                LIST_PATH,
                payload,
                { signal },
            );
            return response;
        },
        toListResult(query),
    );

export const fetchGradingAttempt = (id: string, signal?: AbortSignal) =>
    send(
        async () => {
            const response = await apiGet<unknown>(
                detailPath(id),
                undefined,
                { signal },
            );

            return response;
        },
        toGradingAttempt,
    );

export const saveGradingPoints = (id: string, points: GradingPoints) =>
    send(
        async () => {
            const payload = Object.entries(points).map(([quizAnswerId, value]) => ({
                quiz_answer_id: quizAnswerId,
                admin_points: String(value),
            }));

            console.warn('[saveGradingPoints] Payload:', payload);

            const response = await apiPut<unknown>(
                updatePath(id),
                payload,
            );

            return response;
        },
        () => true,
    );
