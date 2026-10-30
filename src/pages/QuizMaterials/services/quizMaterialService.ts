import { readEnvelope } from '@/helpers/apiEnvelope';
import { apiDelete, apiGet, apiPost, apiPostMultipart, apiPutMultipart } from '@/helpers/apiHelper';
import { isRecord } from '@/helpers/authParsers';
import { strings } from '@/locales/id';
import { createOption, createQuestion, isChoiceType } from '@/pages/QuizMaterials/utils/questionModel';
import { QUESTION_TYPES, QUIZ_AUDIENCES } from '@/pages/QuizMaterials/types';
import type {
    QuestionType,
    QuizAudience,
    QuizDetail,
    QuizListItem,
    QuizListQuery,
    QuizListResult,
    QuizQuestion,
    StoredQuestion,
    TrueFalseAnswer,
} from '@/pages/QuizMaterials/types';
import { toApiFailureCode, toPagination } from '@/services/moduleService';
import type { QuizFailureCode } from '@/types/quiz';
import { fromIsoDate } from '@/utils/dateTime';
import { toHttpsUrl } from '@/utils/httpsUrl';

const QUIZ_LIST_PATH = 'quizzes/get';
const quizPath = (id: string) => `quizzes/${encodeURIComponent(id)}`;
const CREATE_QUIZ_PATH = 'quizzes/create';
const CREATE_QUESTION_PATH = 'quiz-questions/create';
const QUESTION_LIST_PATH = 'quiz-questions/get';
const questionPath = (id: string) => `quiz-questions/${encodeURIComponent(id)}`;

const QUESTION_PAGE_LIMIT = 100;
const MAX_QUESTION_PAGES = 10;

export type SaveFailure = { ok: false; code: QuizFailureCode; message?: string };

type Outcome<T> = { ok: true; data: T } | SaveFailure;

export interface SavedQuestionResult {
    id: string;
    stored: StoredQuestion | null;
}

export interface QuizPayload {
    title: string;
    moduleId: string;
    audiences: QuizAudience[];
    start: string;
    end: string;
    banner: File | null;
}

export interface QuestionSaveRequest {
    quizId: string;
    fields: Record<string, string>;
    image: File | null;
    removeImage: boolean;
}

interface OptionPayload {
    line: number;
    text: string;
    is_correct: boolean;
}

const toWholeNumberText = (value: string): string => String(Number.parseInt(value, 10));

const toOptionPayloads = (question: QuizQuestion): OptionPayload[] => {
    if (isChoiceType(question.type)) {
        return question.options.map((option, index) => ({ line: index + 1, text: option.text.trim(), is_correct: option.isCorrect }));
    }

    if (question.type === 'true_false') {
        return question.trueFalseAnswer === null
            ? []
            : [
                  { line: 1, text: strings.quizContent.trueLabel, is_correct: question.trueFalseAnswer === 'true' },
                  { line: 2, text: strings.quizContent.falseLabel, is_correct: question.trueFalseAnswer === 'false' },
              ];
    }

    return question.expectedAnswer === '' ? [] : [{ line: 1, text: question.expectedAnswer, is_correct: true }];
};

export const toQuestionFields = (question: QuizQuestion, line: number): Record<string, string> => {
    const fields: Record<string, string> = { line: String(line), type: question.type, question: question.text.trim() };

    if (question.estimatedTime !== '') {
        fields.estimated_time = toWholeNumberText(question.estimatedTime);
        fields.estimated_time_unit = question.timeUnit;
    }

    if (question.points !== '') {
        fields.points = toWholeNumberText(question.points);
    }

    const options = toOptionPayloads(question);

    if (options.length > 0) {
        fields.options = JSON.stringify(options);
    }

    return fields;
};

const buildQuestionForm = ({ quizId, fields, image, removeImage }: QuestionSaveRequest): FormData => {
    const form = new FormData();

    form.append('quizzes_id', quizId);

    for (const [name, value] of Object.entries(fields)) {
        form.append(name, value);
    }

    if (image !== null) {
        form.append('image', image);
    }

    form.append('image_delete', String(removeImage));

    return form;
};

const readId = (data: unknown): string | null => (isRecord(data) && typeof data.id === 'string' && data.id !== '' ? data.id : null);

const readWholeNumberText = (value: unknown): string => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(Math.trunc(value));
    }

    return typeof value === 'string' && /^\d+$/.test(value.trim()) ? value.trim() : '';
};

const readJsonList = (value: unknown): unknown[] => {
    if (Array.isArray(value)) {
        return value as unknown[];
    }

    if (typeof value !== 'string') {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(value);

        return Array.isArray(parsed) ? (parsed as unknown[]) : [];
    } catch {
        return [];
    }
};

const readOptions = (value: unknown): { text: string; isCorrect: boolean }[] =>
    readJsonList(value)
        .flatMap((item, index) =>
            isRecord(item) && typeof item.text === 'string'
                ? [{ line: typeof item.line === 'number' ? item.line : index + 1, text: item.text, isCorrect: item.is_correct === true }]
                : [],
        )
        .sort((left, right) => left.line - right.line)
        .map(({ text, isCorrect }) => ({ text, isCorrect }));

const isQuestionType = (value: unknown): value is QuestionType => QUESTION_TYPES.some((type) => type === value);

const toTrueFalseAnswer = (options: { isCorrect: boolean }[]): TrueFalseAnswer | null => {
    const correctIndex = options.findIndex((option) => option.isCorrect);

    if (correctIndex === 0) {
        return 'true';
    }

    return correctIndex === 1 ? 'false' : null;
};

const toStoredQuestion = (value: unknown): StoredQuestion | null => {
    if (isRecord(value) === false || typeof value.id !== 'string' || value.id === '' || isQuestionType(value.type) === false) {
        return null;
    }

    const type = value.type;
    const options = readOptions(value.options);
    const blank = createQuestion();

    return {
        id: value.id,
        line: typeof value.line === 'number' && Number.isFinite(value.line) ? value.line : 0,
        question: {
            ...blank,
            type,
            text: typeof value.question === 'string' ? value.question : '',
            imageUrl: toHttpsUrl(value.image),
            options:
                isChoiceType(type) && options.length > 0
                    ? options.map((option) => ({ ...createOption(), text: option.text, isCorrect: option.isCorrect }))
                    : blank.options,
            trueFalseAnswer: type === 'true_false' ? toTrueFalseAnswer(options) : null,
            expectedAnswer: type === 'short_answer' ? (options.find((option) => option.isCorrect)?.text ?? '') : '',
            estimatedTime: readWholeNumberText(value.estimated_time),
            timeUnit: value.estimated_time_unit === 'seconds' ? 'seconds' : 'minutes',
            points: readWholeNumberText(value.points),
        },
    };
};

const send = async <T>(
    run: () => Promise<{ data: unknown }>,
    parse: (data: unknown) => T | null,
    missing: QuizFailureCode = 'unknown',
): Promise<Outcome<T>> => {
    if (navigator.onLine === false) {
        return { ok: false, code: 'offline' };
    }

    try {
        const { data: body } = await run();
        const envelope = readEnvelope(body);

        if (envelope.ok === false) {
            return envelope.message === null ? { ok: false, code: missing } : { ok: false, code: 'validation', message: envelope.message };
        }

        const parsed = parse(envelope.data);

        return parsed === null ? { ok: false, code: missing } : { ok: true, data: parsed };
    } catch (error) {
        const status = isRecord(error) && typeof error.status === 'number' ? error.status : null;

        return status === 404 ? { ok: false, code: 'not_found' } : { ok: false, code: toApiFailureCode(error) };
    }
};

const toSavedQuestion =
    (knownId: string | null) =>
    (data: unknown): SavedQuestionResult | null => {
        const stored = toStoredQuestion(data);
        const id = stored?.id ?? readId(data) ?? knownId;

        return id === null ? null : { id, stored };
    };

const readIsoDate = (value: unknown): string | null => (typeof value === 'string' && fromIsoDate(value) !== undefined ? value : null);

const toQuizListItem = (value: unknown): QuizListItem | null => {
    if (isRecord(value) === false || typeof value.id !== 'string' || value.id === '') {
        return null;
    }

    const types = readJsonList(value.type);
    const start = readIsoDate(value.start_date);
    const end = readIsoDate(value.end_date);

    return {
        id: value.id,
        title: typeof value.title === 'string' ? value.title : '',
        moduleId: typeof value.modules_id === 'string' ? value.modules_id : '',
        moduleTitle: typeof value.module_title === 'string' ? value.module_title : '',
        audiences: QUIZ_AUDIENCES.filter((audience) => types.includes(audience)),
        period: start === null || end === null ? null : { start, end },
        questionCount: typeof value.question_count === 'number' && Number.isFinite(value.question_count) ? value.question_count : 0,
        createdAt: typeof value.created_at === 'string' && value.created_at !== '' ? value.created_at : null,
    };
};

const toQuizDetail = (data: unknown): QuizDetail | null => {
    const item = toQuizListItem(data);

    if (item === null) {
        return null;
    }

    return {
        id: item.id,
        questionCount: item.questionCount,
        bannerUrl: isRecord(data) ? toHttpsUrl(data.banner) : null,
        info: {
            title: item.title,
            module:
                item.moduleId === ''
                    ? null
                    : {
                          id: item.moduleId,
                          title: item.moduleTitle,
                          description: null,
                          descriptionClean: null,
                          banner: null,
                          linkMaterials: [],
                          category: null,
                      },
            audiences: item.audiences,
            period: item.period,
            banner: null,
        },
    };
};

export const fetchQuizDetail = (id: string, signal?: AbortSignal): Promise<Outcome<QuizDetail>> =>
    send(() => apiGet<unknown>(quizPath(id), undefined, { signal }), toQuizDetail, 'not_found');

export const fetchQuizzes = (query: QuizListQuery, signal?: AbortSignal): Promise<Outcome<QuizListResult>> =>
    send(
        () =>
            apiPost<unknown>(
                QUIZ_LIST_PATH,
                {
                    page: query.page,
                    limit: query.limit,
                    sort_by: 'created_at',
                    sort_order: 'desc',
                    search: query.search,
                    ...(query.moduleId === null ? {} : { modules_id: query.moduleId }),
                    ...(query.audience === 'all' ? {} : { type: query.audience }),
                },
                { signal },
            ),
        (data) =>
            isRecord(data) && Array.isArray(data.items)
                ? {
                      items: (data.items as unknown[]).map(toQuizListItem).filter((item): item is QuizListItem => item !== null),
                      pagination: toPagination(data.pagination, { page: query.page, limit: query.limit }),
                  }
                : null,
    );

const buildQuizForm = (quiz: QuizPayload): FormData => {
    const form = new FormData();

    form.append('title', quiz.title);
    form.append('modules_id', quiz.moduleId);
    form.append('type', JSON.stringify(QUIZ_AUDIENCES.filter((audience) => quiz.audiences.includes(audience))));
    form.append('start_date', quiz.start);
    form.append('end_date', quiz.end);

    if (quiz.banner !== null) {
        form.append('banner', quiz.banner);
    }

    return form;
};

export const createQuiz = (quiz: QuizPayload): Promise<Outcome<string>> =>
    send(() => apiPostMultipart<unknown>(CREATE_QUIZ_PATH, buildQuizForm(quiz)), readId);

export const updateQuiz = async (id: string, quiz: QuizPayload): Promise<Outcome<QuizDetail | null>> => {
    const outcome = await send(
        () => apiPutMultipart<unknown>(quizPath(id), buildQuizForm(quiz)),
        (data) => ({ detail: toQuizDetail(data) }),
    );

    return outcome.ok ? { ok: true, data: outcome.data.detail } : outcome;
};

export const createQuizQuestion = (request: QuestionSaveRequest): Promise<Outcome<SavedQuestionResult>> =>
    send(() => apiPostMultipart<unknown>(CREATE_QUESTION_PATH, buildQuestionForm(request)), toSavedQuestion(null));

export const deleteQuiz = (id: string): Promise<Outcome<true>> =>
    send(
        () => apiDelete<unknown>(quizPath(id)),
        () => true,
    );

export const deleteQuizQuestion = (id: string): Promise<Outcome<true>> =>
    send(
        () => apiDelete<unknown>(questionPath(id)),
        () => true,
    );

export const updateQuizQuestion = (id: string, request: QuestionSaveRequest): Promise<Outcome<SavedQuestionResult>> =>
    send(() => apiPutMultipart<unknown>(questionPath(id), buildQuestionForm(request)), toSavedQuestion(id));

export const fetchQuizQuestions = async (quizId: string, signal?: AbortSignal): Promise<Outcome<StoredQuestion[]>> => {
    const collected = new Map<string, StoredQuestion>();

    for (let page = 1; page <= MAX_QUESTION_PAGES; page += 1) {
        const outcome = await send(
            () =>
                apiPost<unknown>(
                    QUESTION_LIST_PATH,
                    {
                        page,
                        limit: QUESTION_PAGE_LIMIT,
                        sort_by: 'line',
                        sort_order: 'asc',
                        quizzes_id: quizId,
                    },
                    { signal },
                ),
            (data) =>
                isRecord(data) && Array.isArray(data.items)
                    ? {
                          items: (data.items as unknown[]).map(toStoredQuestion).filter((item): item is StoredQuestion => item !== null),
                          totalPages: toPagination(data.pagination, { page, limit: QUESTION_PAGE_LIMIT }).totalPages,
                      }
                    : null,
        );

        if (outcome.ok === false) {
            return outcome;
        }

        for (const item of outcome.data.items) {
            collected.set(item.id, item);
        }

        if (page >= outcome.data.totalPages) {
            break;
        }
    }

    return { ok: true, data: [...collected.values()].sort((left, right) => left.line - right.line) };
};
