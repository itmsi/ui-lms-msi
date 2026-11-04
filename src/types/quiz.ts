import type { ApiFailureCode, ModulePagination } from '@/types/module';
import type { CandidateProgram } from '@/types/user';

export type ParticipantQuestionType = 'multiple_choice' | 'multiple_answers' | 'true_false' | 'short_answer';

export interface ParticipantQuizSummary {
    id: string;
    title: string;
    moduleId: string;
    moduleTitle: string;
    banner: string | null;
    startDate: string;
    endDate: string;
    questionCount: number;
    completedCount: number;
    totalPoint: number | null;
    totalPossiblePoints: number | null;
    isCompleted: boolean;
}

export interface ParticipantQuizQuery {
    page: number;
    limit: number;
    search: string;
    moduleId: string | null;
    program: CandidateProgram | null;
    userId: string;
}

export interface ParticipantQuizListResult {
    items: ParticipantQuizSummary[];
    pagination: ModulePagination;
}

export interface ParticipantOption {
    id: string;
    line: number;
    text: string;
}

export interface ParticipantQuestionRef {
    id: string;
    line: number;
    preview: string;
    isAnswered: boolean;
}

export interface ParticipantQuestion {
    id: string;
    line: number;
    type: ParticipantQuestionType;
    text: string;
    imageUrl: string | null;
    estimatedTime: number | null;
    estimatedTimeUnit: string;
    points: number | null;
    options: ParticipantOption[];
    hasSavedAnswer: boolean;
    savedEntries: QuizAnswerEntry[];
    savedFileUrl: string | null;
}

export interface QuizAnswerEntry {
    line: number;
    text: string;
}

export interface ParticipantQuiz extends ParticipantQuizSummary {
    questions: ParticipantQuestionRef[];
}

export type QuizAnswerValue = string | string[];

export type QuizAnswers = Record<string, QuizAnswerValue>;

export type QuizAttachments = Record<string, File[]>;

export interface SubmittedAttachment {
    name: string;
    size: number | null;
    url: string | null;
}

export interface QuestionReview {
    questionId: string;
    line: number;
    type: ParticipantQuestionType;
    text: string;
    imageUrl: string | null;
    yourAnswer: string[];
    yourAttachments: SubmittedAttachment[];
    correctAnswer: string[];
    isCorrect: boolean;
    pointsEarned: number;
    points: number;
}

export interface QuizAttemptResult {
    quizId: string;
    quizTitle: string;
    moduleTitle: string;
    submittedAt: string;
    score: number;
    maxScore: number;
    correctCount: number;
    questionCount: number;
    review: QuestionReview[];
}

export interface QuizOption {
    id: string;
    title: string;
    moduleTitle: string | null;
}

export interface QuizOptionQuery {
    page: number;
    limit: number;
    search: string;
}

export interface QuizOptionListResult {
    items: QuizOption[];
    pagination: ModulePagination;
}

export type QuizFailureCode = ApiFailureCode | 'not_found';

export type QuizOutcome<T> = { ok: true; data: T } | { ok: false; code: QuizFailureCode; message?: string };
