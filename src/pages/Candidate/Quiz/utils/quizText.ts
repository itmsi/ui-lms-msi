import { strings } from '@/locales/id';
import type { QuizFailureCode } from '@/types/quiz';
import { formatShortDate, fromIsoDate } from '@/utils/dateTime';

const FAILURE_TEXT: Partial<Record<QuizFailureCode, string>> = {
    offline: strings.apiErrors.offlineHappened,
    unauthorized: strings.apiErrors.unauthorizedHappened,
};

export const describeFailure = (code: QuizFailureCode, message?: string): string =>
    message ?? FAILURE_TEXT[code] ?? strings.states.errorWhatHappened;

const TIME_UNIT_LABEL: Record<string, string> = {
    minutes: strings.myQuiz.minutesSuffix,
    seconds: strings.myQuiz.secondsSuffix,
};

export const formatQuestionEstimate = (time: number | null, unit: string): string | null =>
    time === null ? null : `${strings.myQuiz.estimatePrefix} ${String(time)} ${TIME_UNIT_LABEL[unit] ?? unit}`;

export const formatValidUntil = (endDate: string): string => {
    const end = fromIsoDate(endDate);

    return end === undefined ? '' : `${strings.myQuiz.validUntil} ${formatShortDate(end)}`;
};

export const describeQuestionState = (index: number, answered: boolean): string =>
    `${strings.myQuiz.questionLabel} ${String(index + 1)}, ${answered ? strings.myQuiz.stateAnswered : strings.myQuiz.stateUnanswered}`;

export const formatAnsweredCount = (answered: number, total: number) =>
    `${String(answered)} ${strings.myQuiz.answeredOf} ${String(total)} ${strings.myQuiz.answeredSuffix}`;
