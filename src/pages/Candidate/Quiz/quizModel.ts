import { differenceInCalendarDays } from 'date-fns';

import { isRecord } from '@/helpers/authParsers';
import { strings } from '@/locales/id';
import type { ParticipantOption, ParticipantQuestion, ParticipantQuiz, QuizAnswers, QuizAnswerValue, QuizLastAttempt } from '@/types/quiz';
import { formatShortDate, fromIsoDate } from '@/utils/dateTime';

export interface QuizDraft {
    answers: QuizAnswers;
    optionOrder: Record<string, string[]>;
    currentIndex: number;
}

const DRAFT_PREFIX = 'msi-learning:quiz-draft';

const draftKey = (userId: string, quizId: string) => `${DRAFT_PREFIX}:${userId}:${quizId}`;

export const isAnsweredValue = (value: QuizAnswerValue | undefined): boolean =>
    value === undefined ? false : Array.isArray(value) ? value.length > 0 : value.trim() !== '';

export const countAnswered = (questions: readonly ParticipantQuestion[], answers: QuizAnswers): number =>
    questions.filter((question) => isAnsweredValue(answers[question.id])).length;

export const findMissingRequired = (questions: readonly ParticipantQuestion[], answers: QuizAnswers): number[] =>
    questions.flatMap((question, index) => (question.required && isAnsweredValue(answers[question.id]) === false ? [index] : []));

const isAnswerValue = (value: unknown): value is QuizAnswerValue =>
    typeof value === 'string' || (Array.isArray(value) && (value as unknown[]).every((item) => typeof item === 'string'));

const toAnswers = (value: unknown): QuizAnswers =>
    isRecord(value)
        ? Object.fromEntries(Object.entries(value).filter((entry): entry is [string, QuizAnswerValue] => isAnswerValue(entry[1])))
        : {};

const toOptionOrder = (value: unknown): Record<string, string[]> =>
    isRecord(value)
        ? Object.fromEntries(
              Object.entries(value).filter(
                  (entry): entry is [string, string[]] =>
                      Array.isArray(entry[1]) && (entry[1] as unknown[]).every((id) => typeof id === 'string'),
              ),
          )
        : {};

export const readDraft = (userId: string, quizId: string): QuizDraft | null => {
    try {
        const raw = localStorage.getItem(draftKey(userId, quizId));
        const parsed: unknown = raw === null ? null : JSON.parse(raw);

        if (isRecord(parsed) === false) {
            return null;
        }

        return {
            answers: toAnswers(parsed.answers),
            optionOrder: toOptionOrder(parsed.optionOrder),
            currentIndex: typeof parsed.currentIndex === 'number' ? parsed.currentIndex : 0,
        };
    } catch {
        return null;
    }
};

export const writeDraft = (userId: string, quizId: string, draft: QuizDraft) => {
    try {
        localStorage.setItem(draftKey(userId, quizId), JSON.stringify(draft));
    } catch {
        return;
    }
};

export const clearDraft = (userId: string, quizId: string) => {
    try {
        localStorage.removeItem(draftKey(userId, quizId));
    } catch {
        return;
    }
};

export const countDraftAnswers = (draft: QuizDraft | null): number =>
    draft === null ? 0 : Object.values(draft.answers).filter((value) => isAnsweredValue(value)).length;

const shuffleIds = (ids: readonly string[]): string[] => {
    const result = [...ids];

    for (let index = result.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(Math.random() * (index + 1));
        [result[index], result[swap]] = [result[swap], result[index]];
    }

    return result;
};

export const createDraft = (quiz: ParticipantQuiz): QuizDraft => ({
    answers: {},
    optionOrder: Object.fromEntries(
        quiz.questions
            .filter((question) => question.shuffle)
            .map((question) => [question.id, shuffleIds(question.options.map((item) => item.id))]),
    ),
    currentIndex: 0,
});

export const fitDraft = (draft: QuizDraft, quiz: ParticipantQuiz): QuizDraft => {
    const questionIds = new Set(quiz.questions.map((question) => question.id));

    return {
        ...draft,
        answers: Object.fromEntries(Object.entries(draft.answers).filter(([questionId]) => questionIds.has(questionId))),
        currentIndex: Math.min(Math.max(draft.currentIndex, 0), Math.max(quiz.questions.length - 1, 0)),
    };
};

export const orderOptions = (question: ParticipantQuestion, optionOrder: Record<string, string[]>): ParticipantOption[] => {
    const order = optionOrder[question.id];

    if (order?.length !== question.options.length) {
        return question.options;
    }

    const byId = new Map(question.options.map((item) => [item.id, item]));
    const ordered = order.map((id) => byId.get(id)).filter((item): item is ParticipantOption => item !== undefined);

    return ordered.length === question.options.length ? ordered : question.options;
};

export const formatEstimate = (seconds: number | null): string | null => {
    if (seconds === null || seconds <= 0) {
        return null;
    }

    return seconds < 60
        ? strings.myQuiz.underOneMinute
        : `${strings.myQuiz.estimatePrefix} ${String(Math.ceil(seconds / 60))} ${strings.myQuiz.minutesSuffix}`;
};

const URGENT_DAYS_LEFT = 3;

export const formatValidUntil = (endDate: string): string => {
    const end = fromIsoDate(endDate);

    return end === undefined ? '' : `${strings.myQuiz.validUntil} ${formatShortDate(end)}`;
};

export const describeTimeLeft = (endDate: string, today: string): { label: string; urgent: boolean } | null => {
    const end = fromIsoDate(endDate);
    const now = fromIsoDate(today);

    if (end === undefined || now === undefined) {
        return null;
    }

    const daysLeft = differenceInCalendarDays(end, now);

    if (daysLeft < 0) {
        return null;
    }

    const label =
        daysLeft === 0
            ? strings.myQuiz.endsToday
            : daysLeft === 1
              ? strings.myQuiz.endsTomorrow
              : `${String(daysLeft)} ${strings.myQuiz.daysLeftSuffix}`;

    return { label, urgent: daysLeft <= URGENT_DAYS_LEFT };
};

export const describeQuestionState = (question: ParticipantQuestion, index: number, answered: boolean): string =>
    [
        `${strings.myQuiz.questionLabel} ${String(index + 1)}`,
        answered ? strings.myQuiz.stateAnswered : strings.myQuiz.stateUnanswered,
        question.required ? strings.myQuiz.stateRequired : null,
    ]
        .filter((part): part is string => part !== null)
        .join(', ');

export const resultActionLabel = (attempt: QuizLastAttempt | null): string =>
    attempt?.score === null ? strings.myQuiz.viewResult : strings.myQuiz.viewScore;

export const formatAnsweredCount = (answered: number, total: number) =>
    `${String(answered)} ${strings.myQuiz.answeredOf} ${String(total)} ${strings.myQuiz.answeredSuffix}`;
