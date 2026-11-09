import type { ModulePagination } from '@/types/module';
import type { QuestionReview, QuizGradingStatus } from '@/types/quiz';

export type QuizResultStatus = 'completed' | 'not_completed';

export type QuizResultStatusFilter = 'all' | QuizResultStatus;

export interface QuizResultRow {
    // employeeId: string;
    employeeName: string;
    quizId: string;
    quizTitle: string;
    moduleTitle: string;
    status: QuizResultStatus;
    // attemptId: string | null;
    score: number | null;
    maxScore: number;
    submittedAt: string | null;
    isAdjusted: boolean;
    adjustedAt: string | null;
    adjustedByName: string | null;
}

export interface QuizResultListResult {
    items: QuizResultRow[];
    pagination: ModulePagination;
}

export interface QuizResultQuery {
    page: number;
    limit: number;
    search: string;
    quizId: string | null;
    employeeId: string | null;
    status: QuizResultStatusFilter;
}

export interface GradingReview extends QuestionReview {
    quizAnswerId: string;
    autoPointsEarned: number;
}

export interface GradingAttempt {
    id: string;
    quizId: string;
    quizTitle: string;
    moduleTitle: string;
    employeeName: string;
    submittedAt: string;
    score: number;
    maxScore: number;
    correctCount: number;
    questionCount: number;
    gradingStatus: QuizGradingStatus;
    adjustedAt: string | null;
    adjustedByName: string | null;
    review: GradingReview[];
}

export type GradingPoints = Record<string, number>;
