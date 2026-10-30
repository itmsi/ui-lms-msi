import type { QuestionReview } from '@/types/quiz';

export const hasSubmittedAnswer = (item: Pick<QuestionReview, 'yourAnswer' | 'yourAttachments'>): boolean =>
    item.yourAnswer.length > 0 || item.yourAttachments.length > 0;
