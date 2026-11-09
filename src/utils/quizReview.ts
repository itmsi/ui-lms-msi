import type { QuestionReview, QuizGradingStatus } from '@/types/quiz';

export const hasSubmittedAnswer = (item: Pick<QuestionReview, 'yourAnswer' | 'yourAttachments'>): boolean =>
    item.yourAnswer.length > 0 || item.yourAttachments.length > 0;

export const toQuizGradingStatus = (value: unknown): QuizGradingStatus => {
    const status = typeof value === 'string' ? value.toLowerCase() : '';

    return status === 'pending' || status === 'failed' ? status : 'completed';
};

export const isGradingPending = (status: QuizGradingStatus): boolean => status !== 'completed';
