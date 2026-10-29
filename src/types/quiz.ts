import type { ApiFailureCode } from '@/types/module';

export type ParticipantQuestionType = 'multiple_choice' | 'multiple_answers' | 'true_false' | 'short_answer';

export interface QuizLastAttempt {
    id: string;
    score: number | null;
    maxScore: number | null;
    submittedAt: string;
}

export interface ParticipantQuizSummary {
    id: string;
    title: string;
    moduleId: string;
    moduleTitle: string;
    moduleBanner: string | null;
    startDate: string;
    endDate: string;
    questionCount: number;
    estimatedSeconds: number | null;
    isCompleted: boolean;
    lastAttempt: QuizLastAttempt | null;
}

export interface ParticipantOption {
    id: string;
    text: string;
}

export interface ParticipantQuestion {
    id: string;
    line: number;
    type: ParticipantQuestionType;
    text: string;
    required: boolean;
    imageUrl: string | null;
    shuffle: boolean;
    estimatedSeconds: number | null;
    points: number | null;
    options: ParticipantOption[];
}

export interface ParticipantQuiz extends ParticipantQuizSummary {
    questions: ParticipantQuestion[];
}

export type QuizAnswerValue = string | string[];

export type QuizAnswers = Record<string, QuizAnswerValue>;

export interface QuizResultScreen {
    title: string;
    message: string;
    showScore: boolean;
    showCorrectAnswers: boolean;
}

export interface QuestionReview {
    questionId: string;
    line: number;
    type: ParticipantQuestionType;
    text: string;
    yourAnswer: string[];
    correctAnswer: string[];
    isCorrect: boolean;
    pointsEarned: number;
    points: number;
}

export interface QuizAttemptResult {
    id: string;
    quizId: string;
    quizTitle: string;
    moduleTitle: string;
    submittedAt: string;
    score: number;
    maxScore: number;
    correctCount: number;
    questionCount: number;
    resultScreen: QuizResultScreen;
    review: QuestionReview[] | null;
}

export type QuizFailureCode = ApiFailureCode | 'not_found';

export type QuizOutcome<T> = { ok: true; data: T } | { ok: false; code: QuizFailureCode; message?: string };
