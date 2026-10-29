import { readEnvelope } from '@/helpers/apiEnvelope';
import { isRecord } from '@/helpers/authParsers';
import { strings } from '@/locales/id';
import { toApiFailureCode } from '@/services/moduleService';
import { mockQuizRequest } from '@/services/mocks/quizMock';
import type {
    ParticipantOption,
    ParticipantQuestion,
    ParticipantQuestionType,
    ParticipantQuiz,
    ParticipantQuizSummary,
    QuestionReview,
    QuizAnswers,
    QuizAttemptResult,
    QuizLastAttempt,
    QuizOutcome,
} from '@/types/quiz';

const LIST_PATH = 'quizzes/participant/get';
const detailPath = (id: string) => `quizzes/participant/get/${encodeURIComponent(id)}`;
const SUBMIT_PATH = 'quiz-attempts/submit';
const attemptPath = (id: string) => `quiz-attempts/get/${encodeURIComponent(id)}`;

const QUESTION_TYPES: readonly ParticipantQuestionType[] = ['multiple_choice', 'multiple_answers', 'true_false', 'short_answer'];

const TRUE_FALSE_OPTIONS: ParticipantOption[] = [
    { id: 'true', text: strings.myQuiz.trueLabel },
    { id: 'false', text: strings.myQuiz.falseLabel },
];

const readString = (value: unknown): string => (typeof value === 'string' ? value : '');

const readNumber = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null);

const readStringList = (value: unknown): string[] =>
    Array.isArray(value) ? (value as unknown[]).filter((item): item is string => typeof item === 'string') : [];

const isQuestionType = (value: unknown): value is ParticipantQuestionType => QUESTION_TYPES.some((type) => type === value);

const toEstimatedSeconds = (time: unknown, unit: unknown): number | null => {
    const amount = readNumber(time);

    return amount === null ? null : amount * (unit === 'seconds' ? 1 : 60);
};

const toLastAttempt = (value: unknown): QuizLastAttempt | null => {
    if (isRecord(value) === false || typeof value.id !== 'string') {
        return null;
    }

    return {
        id: value.id,
        score: readNumber(value.score),
        maxScore: readNumber(value.max_score),
        submittedAt: readString(value.submitted_at),
    };
};

const toSummaryBase = (value: Record<string, unknown> & { id: string }) => ({
    id: value.id,
    title: readString(value.title),
    moduleId: readString(value.modules_id),
    moduleTitle: readString(value.module_title),
    moduleBanner: typeof value.module_banner === 'string' && value.module_banner !== '' ? value.module_banner : null,
    startDate: readString(value.start_date),
    endDate: readString(value.end_date),
    questionCount: readNumber(value.question_count) ?? 0,
    estimatedSeconds: readNumber(value.estimated_seconds),
    isCompleted: value.is_completed === true,
    lastAttempt: toLastAttempt(value.last_attempt),
});

const toSummary = (value: unknown): ParticipantQuizSummary | null =>
    isRecord(value) && typeof value.id === 'string' ? toSummaryBase({ ...value, id: value.id }) : null;

const toOption = (value: unknown): ParticipantOption | null =>
    isRecord(value) && typeof value.id === 'string' ? { id: value.id, text: readString(value.text) } : null;

const toQuestion = (value: unknown): ParticipantQuestion | null => {
    if (isRecord(value) === false || typeof value.id !== 'string' || isQuestionType(value.type) === false) {
        return null;
    }

    const options = Array.isArray(value.options)
        ? (value.options as unknown[]).map(toOption).filter((item): item is ParticipantOption => item !== null)
        : [];

    return {
        id: value.id,
        line: readNumber(value.line) ?? 0,
        type: value.type,
        text: readString(value.question),
        required: value.required !== false,
        imageUrl: typeof value.image === 'string' && value.image !== '' ? value.image : null,
        shuffle: value.choice_order === 'shuffle',
        estimatedSeconds: toEstimatedSeconds(value.estimated_time, value.estimated_time_unit),
        points: readNumber(value.points),
        options: value.type === 'true_false' ? TRUE_FALSE_OPTIONS : options,
    };
};

const toQuiz = (value: unknown): ParticipantQuiz | null => {
    if (isRecord(value) === false || typeof value.id !== 'string') {
        return null;
    }

    const questions = Array.isArray(value.questions)
        ? (value.questions as unknown[])
              .map(toQuestion)
              .filter((item): item is ParticipantQuestion => item !== null)
              .sort((left, right) => left.line - right.line)
        : [];

    return { ...toSummaryBase({ ...value, id: value.id }), questions };
};

const toReview = (value: unknown): QuestionReview | null => {
    if (isRecord(value) === false || typeof value.quiz_questions_id !== 'string' || isQuestionType(value.type) === false) {
        return null;
    }

    return {
        questionId: value.quiz_questions_id,
        line: readNumber(value.line) ?? 0,
        type: value.type,
        text: readString(value.question),
        yourAnswer: readStringList(value.your_answer),
        correctAnswer: readStringList(value.correct_answer),
        isCorrect: value.is_correct === true,
        pointsEarned: readNumber(value.points_earned) ?? 0,
        points: readNumber(value.points) ?? 0,
    };
};

const toAttempt = (value: unknown): QuizAttemptResult | null => {
    if (isRecord(value) === false || typeof value.id !== 'string') {
        return null;
    }

    const screen = isRecord(value.result_screen) ? value.result_screen : {};

    return {
        id: value.id,
        quizId: readString(value.quizzes_id),
        quizTitle: readString(value.quiz_title),
        moduleTitle: readString(value.module_title),
        submittedAt: readString(value.submitted_at),
        score: readNumber(value.score) ?? 0,
        maxScore: readNumber(value.max_score) ?? 0,
        correctCount: readNumber(value.correct_count) ?? 0,
        questionCount: readNumber(value.question_count) ?? 0,
        resultScreen: {
            title: readString(screen.title),
            message: readString(screen.message),
            showScore: screen.show_score !== false,
            showCorrectAnswers: screen.show_correct_answers === true,
        },
        review: Array.isArray(value.review)
            ? (value.review as unknown[]).map(toReview).filter((item): item is QuestionReview => item !== null)
            : null,
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
        const { data: body } = await mockQuizRequest(path, payload, signal);
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

const toSummaryList = (data: unknown): ParticipantQuizSummary[] | null =>
    Array.isArray(data) ? (data as unknown[]).map(toSummary).filter((item): item is ParticipantQuizSummary => item !== null) : null;

export const fetchMyQuizzes = (signal?: AbortSignal) => request(LIST_PATH, toSummaryList, undefined, signal);

export const fetchParticipantQuiz = (id: string, signal?: AbortSignal) => request(detailPath(id), toQuiz, undefined, signal);

export const fetchQuizAttempt = (id: string, signal?: AbortSignal) => request(attemptPath(id), toAttempt, undefined, signal);

const toAnswerPayload = (question: ParticipantQuestion, answers: QuizAnswers) => {
    const value = answers[question.id];
    const isChoice = question.type === 'multiple_choice' || question.type === 'multiple_answers';
    const values = value === undefined ? [] : Array.isArray(value) ? value : [value];

    return {
        quiz_questions_id: question.id,
        option_ids: isChoice ? values : [],
        answer_text: isChoice ? null : (values[0]?.trim() ?? ''),
    };
};

export const submitQuizAttempt = (quiz: ParticipantQuiz, answers: QuizAnswers) =>
    request(SUBMIT_PATH, toAttempt, {
        quizzes_id: quiz.id,
        answers: quiz.questions.map((question) => toAnswerPayload(question, answers)),
    });
