import type { QuizAnswers } from '@/types/quiz';

export interface SavedAnswer {
    answer: string;
    files: string;
}

export interface QuizDraft {
    answers: QuizAnswers;
    currentIndex: number;
    saved: Record<string, SavedAnswer>;
}
