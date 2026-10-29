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

export type ChoiceOrder = 'keep' | 'shuffle';

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
    required: boolean;
    image: File | null;
    options: AnswerOption[];
    trueFalseAnswer: TrueFalseAnswer | null;
    expectedAnswer: string;
    choiceOrder: ChoiceOrder;
    estimatedTime: string;
    timeUnit: TimeUnit;
    points: string;
}

export interface ResultScreen {
    title: string;
    message: string;
    showScore: boolean;
    showCorrectAnswers: boolean;
}

export type ContentSelection = { kind: 'question'; key: string } | { kind: 'result' };

export type QuestionIssue = 'text' | 'optionCount' | 'optionText' | 'correct' | 'expected';
