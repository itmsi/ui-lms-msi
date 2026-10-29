import type { DateRange } from '@/types/dateRange';
import type { LearningModule } from '@/types/module';

export type QuizAudience = 'reguler' | 'mt';

export interface QuizInfo {
    title: string;
    module: LearningModule | null;
    audiences: QuizAudience[];
    period: DateRange | null;
}

export type QuizInfoField = 'title' | 'module' | 'audiences' | 'period';

export type QuizSchedule = 'draft' | 'active' | 'ended';

export type QuizInfoErrors = Partial<Record<QuizInfoField, string>>;

export type QuizStep = 'info' | 'content';

export const QUIZ_AUDIENCES: readonly QuizAudience[] = ['reguler', 'mt'];

export type QuestionType = 'multiple_choice' | 'multiple_answers' | 'true_false' | 'short_answer';

export const QUESTION_TYPES: readonly QuestionType[] = ['multiple_choice', 'multiple_answers', 'true_false', 'short_answer'];

export type TimeUnit = 'minutes' | 'seconds';

export type TrueFalseAnswer = 'true' | 'false';

export interface AnswerOption {
    key: string;
    text: string;
    isCorrect: boolean;
}

export interface QuizQuestion {
    key: string;
    type: QuestionType;
    text: string;
    image: File | null;
    options: AnswerOption[];
    trueFalseAnswer: TrueFalseAnswer | null;
    expectedAnswer: string;
    estimatedTime: string;
    timeUnit: TimeUnit;
    points: string;
}

export type QuestionIssue = 'text' | 'optionCount' | 'optionText' | 'correct' | 'expected';
