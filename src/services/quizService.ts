import { readEnvelope } from '@/helpers/apiEnvelope';
import { apiGet, apiPost, apiPostMultipart } from '@/helpers/apiHelper';
import { isRecord } from '@/helpers/authParsers';
import { strings } from '@/locales/id';
import { toApiFailureCode, toPagination } from '@/services/moduleService';
import type {
    ParticipantOption,
    ParticipantQuestion,
    ParticipantQuestionRef,
    ParticipantQuestionType,
    ParticipantQuiz,
    ParticipantQuizListResult,
    ParticipantQuizQuery,
    ParticipantQuizSummary,
    QuestionReview,
    QuizAnswerEntry,
    QuizAttemptResult,
    QuizOutcome,
    SubmittedAttachment,
} from '@/types/quiz';
import { toHttpsUrl } from '@/utils/httpsUrl';

const LIST_PATH = 'quiz-answers/quizzes/get';
const detailPath = (id: string) => `quiz-answers/quizzes/get/${encodeURIComponent(id)}`;
const QUESTION_PATH = 'quiz-answers/questions';
const ANSWER_PATH = 'quiz-answers/create';
const RESULT_PATH = 'quiz-answers/results';

const QUESTION_TYPES: readonly ParticipantQuestionType[] = ['multiple_choice', 'multiple_answers', 'true_false', 'short_answer'];

const TRUE_FALSE_OPTIONS: ParticipantOption[] = [
    { id: '1', line: 1, text: strings.myQuiz.trueLabel },
    { id: '2', line: 2, text: strings.myQuiz.falseLabel },
];

const readString = (value: unknown): string => (typeof value === 'string' ? value : '');

const readNumber = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null);

const readNumeric = (value: unknown): number | null => readNumber(typeof value === 'string' && value.trim() !== '' ? Number(value) : value);

const readStringList = (value: unknown): string[] =>
    Array.isArray(value) ? (value as unknown[]).filter((item): item is string => typeof item === 'string') : [];

const isQuestionType = (value: unknown): value is ParticipantQuestionType => QUESTION_TYPES.some((type) => type === value);

const toSummaryBase = (value: Record<string, unknown> & { id: string }) => {
    const questionCount = readNumeric(value.question_count) ?? 0;
    const completedCount = readNumeric(value.completed_count) ?? 0;
    return {
        id: value.id,
        title: readString(value.title),
        moduleId: readString(value.modules_id),
        moduleTitle: readString(value.module_title),
        banner: toHttpsUrl(value.banner),
        startDate: readString(value.start_date),
        endDate: readString(value.end_date),
        questionCount,
        completedCount,
        totalPoint: readNumeric(value.total_point),
        totalPossiblePoints: readNumeric(value.total_possible_points),
        isCompleted: questionCount > 0 && completedCount >= questionCount,
    };
};

const toSummary = (value: unknown): ParticipantQuizSummary | null =>
    isRecord(value) && typeof value.quizzes_id === 'string' ? toSummaryBase({ ...value, id: value.quizzes_id }) : null;

const readEntries = (value: unknown): QuizAnswerEntry[] =>
    Array.isArray(value)
        ? (value as unknown[])
              .flatMap((item) =>
                  isRecord(item) && typeof item.line === 'number' ? [{ line: item.line, text: readString(item.text) }] : [],
              )
              .sort((left, right) => left.line - right.line)
        : [];

const toChoiceOptions = (value: unknown): ParticipantOption[] =>
    readEntries(value).map((item) => ({ id: String(item.line), line: item.line, text: item.text }));

const toOptions = (type: ParticipantQuestionType, value: unknown): ParticipantOption[] => {
    if (type === 'true_false') {
        return TRUE_FALSE_OPTIONS;
    }

    return type === 'short_answer' ? [] : toChoiceOptions(value);
};

const toQuestion = (value: unknown): ParticipantQuestion | null => {
    if (isRecord(value) === false || typeof value.quiz_question_id !== 'string' || isQuestionType(value.type) === false) {
        return null;
    }

    const answer = isRecord(value.answer) ? value.answer : null;

    return {
        id: value.quiz_question_id,
        line: readNumber(value.line) ?? 0,
        type: value.type,
        text: readString(value.question),
        imageUrl: toHttpsUrl(value.image),
        estimatedTime: readNumeric(value.estimated_time),
        estimatedTimeUnit: readString(value.estimated_time_unit),
        points: readNumber(value.points),
        options: toOptions(value.type, value.options),
        hasSavedAnswer: value.answer !== null && value.answer !== undefined,
        savedEntries: readEntries(answer?.answers),
        savedFileUrl: toHttpsUrl(answer?.files),
    };
};

const toQuestionRef = (value: unknown): ParticipantQuestionRef | null =>
    isRecord(value) && typeof value.id === 'string'
        ? { id: value.id, line: readNumber(value.line) ?? 0, preview: readString(value.question), isAnswered: value.is_answer === true }
        : null;

const toQuiz = (value: unknown): ParticipantQuiz | null => {
    if (isRecord(value) === false || typeof value.id !== 'string') {
        return null;
    }

    const questions = Array.isArray(value.questions)
        ? (value.questions as unknown[])
              .map(toQuestionRef)
              .filter((item): item is ParticipantQuestionRef => item !== null)
              .sort((left, right) => left.line - right.line)
        : [];

    return {
        ...toSummaryBase({ ...value, id: value.id }),
        isCompleted: questions.length > 0 && questions.every((question) => question.isAnswered),
        questions,
    };
};

const toSubmittedAttachment = (value: unknown): SubmittedAttachment | null =>
    isRecord(value) && typeof value.name === 'string'
        ? { name: value.name, size: readNumber(value.size), url: toHttpsUrl(value.url) }
        : null;

const toSubmittedAttachments = (value: unknown): SubmittedAttachment[] =>
    Array.isArray(value)
        ? (value as unknown[]).map(toSubmittedAttachment).filter((item): item is SubmittedAttachment => item !== null)
        : [];

export const toQuestionReview = (value: unknown): QuestionReview | null => {
    if (isRecord(value) === false || typeof value.quiz_questions_id !== 'string' || isQuestionType(value.type) === false) {
        return null;
    }

    return {
        questionId: value.quiz_questions_id,
        line: readNumber(value.line) ?? 0,
        type: value.type,
        text: readString(value.question),
        imageUrl: toHttpsUrl(value.image),
        yourAnswer: readStringList(value.your_answer),
        yourAttachments: toSubmittedAttachments(value.your_attachments),
        correctAnswer: readStringList(value.correct_answer),
        isCorrect: value.is_correct === true,
        pointsEarned: readNumber(value.points_earned) ?? 0,
        points: readNumber(value.points) ?? 0,
    };
};

const toSavedFiles = (value: unknown): SubmittedAttachment[] => {
    const url = toHttpsUrl(value);

    return url === null ? [] : [{ name: strings.myQuiz.savedFileLink, size: null, url }];
};

const readEntryTexts = (value: unknown): string[] =>
    Array.isArray(value)
        ? (value as unknown[]).flatMap((item) => (isRecord(item) && typeof item.text === 'string' ? [item.text] : []))
        : [];

const toResultReview = (value: unknown): QuestionReview | null => {
    if (isRecord(value) === false || typeof value.quiz_question_id !== 'string' || isQuestionType(value.type) === false) {
        return null;
    }

    const answer = isRecord(value.answer) ? value.answer : null;

    return {
        questionId: value.quiz_question_id,
        line: readNumber(value.line) ?? 0,
        type: value.type,
        text: readString(value.question),
        imageUrl: toHttpsUrl(value.image),
        yourAnswer: readEntryTexts(answer?.answers),
        yourAttachments: toSavedFiles(answer?.files),
        correctAnswer: readEntryTexts(value.question_answer),
        isCorrect: answer?.answer_status === 'correct',
        pointsEarned: readNumeric(answer?.admin_points) ?? readNumeric(answer?.points) ?? 0,
        points: readNumeric(value.points) ?? 0,
    };
};

const toResult = (value: unknown): QuizAttemptResult | null => {
    if (isRecord(value) === false || typeof value.quizzes_id !== 'string') {
        return null;
    }

    const review = Array.isArray(value.questions)
        ? (value.questions as unknown[])
              .map(toResultReview)
              .filter((item): item is QuestionReview => item !== null)
              .sort((left, right) => left.line - right.line)
        : [];

    return {
        quizId: value.quizzes_id,
        quizTitle: readString(value.title),
        moduleTitle: readString(value.module_title),
        submittedAt: readString(value.updated_at),
        score: readNumeric(value.total_point) ?? 0,
        maxScore: review.reduce((total, item) => total + item.points, 0),
        correctCount: review.filter((item) => item.isCorrect).length,
        questionCount: review.length,
        review,
    };
};

export const send = async <T>(run: () => Promise<{ data: unknown }>, parse: (data: unknown) => T | null): Promise<QuizOutcome<T>> => {
    if (navigator.onLine === false) {
        return { ok: false, code: 'offline' };
    }

    try {
        const { data: body } = await run();
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

const toListResult =
    (query: ParticipantQuizQuery) =>
    (data: unknown): ParticipantQuizListResult | null =>
        isRecord(data) && Array.isArray(data.items)
            ? {
                  items: (data.items as unknown[]).map(toSummary).filter((item): item is ParticipantQuizSummary => item !== null),
                  pagination: toPagination(data.pagination, { page: query.page, limit: query.limit }),
              }
            : null;

export const fetchMyQuizzes = (query: ParticipantQuizQuery, signal?: AbortSignal) =>
    send(
        () =>
            apiPost<unknown>(
                LIST_PATH,
                {
                    page: query.page,
                    limit: query.limit,
                    sort_by: 'created_at',
                    sort_order: 'desc',
                    search: query.search,
                    modules_id: query.moduleId ?? '',
                    ...(query.program === null ? {} : { type: query.program }),
                    created_by: query.userId,
                },
                { signal },
            ),
        toListResult(query),
    );

export const fetchParticipantQuiz = (id: string, signal?: AbortSignal) =>
    send(() => apiGet<unknown>(detailPath(id), undefined, { signal }), toQuiz);

export const fetchParticipantQuestion = (questionId: string, userId: string, signal?: AbortSignal) =>
    send(() => apiPost<unknown>(QUESTION_PATH, { quiz_question_id: questionId, created_by: userId }, { signal }), toQuestion);

export const fetchQuizResult = (quizId: string, userId: string, signal?: AbortSignal) =>
    send(() => apiPost<unknown>(RESULT_PATH, { quizzes_id: quizId, created_by: userId }, { signal }), toResult);

export const saveQuizAnswer = (
    questionId: string,
    entries: readonly QuizAnswerEntry[],
    files: readonly File[],
    sendDate: string | null,
) => {
    const form = new FormData();

    form.append('quiz_question_id', questionId);
    form.append('answers', JSON.stringify(entries.map(({ line, text }) => ({ line, text, is_correct: true }))));
    files.forEach((file) => form.append('files', file, file.name));

    if (sendDate !== null) {
        form.append('send_date', sendDate);
    }

    return send(
        () => apiPostMultipart<unknown>(ANSWER_PATH, form),
        () => true as const,
    );
};
