import { differenceInCalendarDays } from 'date-fns';

import { isRecord } from '@/helpers/authParsers';
import { strings } from '@/locales/id';
import type { ParticipantQuestion, ParticipantQuiz, QuizAnswers, QuizAnswerValue, QuizAttachments } from '@/types/quiz';
import { formatShortDate, fromIsoDate } from '@/utils/dateTime';
import { htmlToPlainText } from '@/utils/htmlText';

export interface QuizDraft {
    answers: QuizAnswers;
    currentIndex: number;
}

const DRAFT_PREFIX = 'msi-learning:quiz-draft';

const draftKey = (userId: string, quizId: string) => `${DRAFT_PREFIX}:${userId}:${quizId}`;

export const isAnsweredValue = (value: QuizAnswerValue | undefined): boolean =>
    value === undefined ? false : Array.isArray(value) ? value.length > 0 : value.trim() !== '';

const hasAnswer = (question: ParticipantQuestion, value: QuizAnswerValue | undefined): boolean =>
    question.type === 'short_answer' ? typeof value === 'string' && htmlToPlainText(value) !== '' : isAnsweredValue(value);

export const findAnsweredIds = (
    questions: readonly ParticipantQuestion[],
    answers: QuizAnswers,
    attachments: QuizAttachments,
): ReadonlySet<string> =>
    new Set(
        questions
            .filter((question) => hasAnswer(question, answers[question.id]) || (attachments[question.id]?.length ?? 0) > 0)
            .map((question) => question.id),
    );

export const findUnanswered = (questions: readonly ParticipantQuestion[], answeredIds: ReadonlySet<string>): number[] =>
    questions.flatMap((question, index) => (answeredIds.has(question.id) ? [] : [index]));

export const fitAttachments = (attachments: QuizAttachments, quiz: ParticipantQuiz): QuizAttachments => {
    const questionIds = new Set(quiz.questions.filter((question) => question.type === 'short_answer').map((question) => question.id));

    return Object.fromEntries(Object.entries(attachments).filter(([questionId, files]) => questionIds.has(questionId) && files.length > 0));
};

const isAnswerValue = (value: unknown): value is QuizAnswerValue =>
    typeof value === 'string' || (Array.isArray(value) && (value as unknown[]).every((item) => typeof item === 'string'));

const toAnswers = (value: unknown): QuizAnswers =>
    isRecord(value)
        ? Object.fromEntries(Object.entries(value).filter((entry): entry is [string, QuizAnswerValue] => isAnswerValue(entry[1])))
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

export const createDraft = (): QuizDraft => ({ answers: {}, currentIndex: 0 });

export const fitDraft = (draft: QuizDraft, quiz: ParticipantQuiz): QuizDraft => {
    const questionIds = new Set(quiz.questions.map((question) => question.id));

    return {
        ...draft,
        answers: Object.fromEntries(Object.entries(draft.answers).filter(([questionId]) => questionIds.has(questionId))),
        currentIndex: Math.min(Math.max(draft.currentIndex, 0), Math.max(quiz.questions.length - 1, 0)),
    };
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

export const describeQuestionState = (index: number, answered: boolean): string =>
    `${strings.myQuiz.questionLabel} ${String(index + 1)}, ${answered ? strings.myQuiz.stateAnswered : strings.myQuiz.stateUnanswered}`;

export const formatAnsweredCount = (answered: number, total: number) =>
    `${String(answered)} ${strings.myQuiz.answeredOf} ${String(total)} ${strings.myQuiz.answeredSuffix}`;
