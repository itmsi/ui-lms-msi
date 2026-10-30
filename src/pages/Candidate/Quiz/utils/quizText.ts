import { strings } from '@/locales/id';
import { formatShortDate, fromIsoDate } from '@/utils/dateTime';

export const formatEstimate = (seconds: number | null): string | null => {
    if (seconds === null || seconds <= 0) {
        return null;
    }

    return seconds < 60
        ? strings.myQuiz.underOneMinute
        : `${strings.myQuiz.estimatePrefix} ${String(Math.ceil(seconds / 60))} ${strings.myQuiz.minutesSuffix}`;
};

export const formatValidUntil = (endDate: string): string => {
    const end = fromIsoDate(endDate);

    return end === undefined ? '' : `${strings.myQuiz.validUntil} ${formatShortDate(end)}`;
};

export const describeQuestionState = (index: number, answered: boolean): string =>
    `${strings.myQuiz.questionLabel} ${String(index + 1)}, ${answered ? strings.myQuiz.stateAnswered : strings.myQuiz.stateUnanswered}`;

export const formatAnsweredCount = (answered: number, total: number) =>
    `${String(answered)} ${strings.myQuiz.answeredOf} ${String(total)} ${strings.myQuiz.answeredSuffix}`;
