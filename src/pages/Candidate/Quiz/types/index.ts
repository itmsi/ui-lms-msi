import type { QuizAnswers } from '@/types/quiz';

export interface QuizDraft {
    answers: QuizAnswers;
    currentIndex: number;
}
