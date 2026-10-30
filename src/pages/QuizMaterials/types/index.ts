import type { DateRange } from '@/types/dateRange';
import type { LearningModule, ModulePagination } from '@/types/module';

export type QuizAudience = 'reguler' | 'mt';

export interface QuizInfo {
    title: string;
    module: LearningModule | null;
    audiences: QuizAudience[];
    period: DateRange | null;
    banner: File | null;
}

export type QuizInfoField = 'title' | 'module' | 'audiences' | 'period' | 'banner';

export type QuizSchedule = 'draft' | 'active' | 'ended';

export type QuizInfoErrors = Partial<Record<QuizInfoField, string>>;

export const QUIZ_AUDIENCES: readonly QuizAudience[] = ['reguler', 'mt'];

export type QuizAudienceFilter = 'all' | QuizAudience;

export interface QuizListItem {
    id: string;
    title: string;
    moduleId: string;
    moduleTitle: string;
    audiences: QuizAudience[];
    period: DateRange | null;
    questionCount: number;
    createdAt: string | null;
}

export interface QuizDetail {
    id: string;
    info: QuizInfo;
    bannerUrl: string | null;
    questionCount: number;
}

export interface QuizListQuery {
    page: number;
    limit: number;
    search: string;
    moduleId: string | null;
    audience: QuizAudienceFilter;
}

export interface QuizListResult {
    items: QuizListItem[];
    pagination: ModulePagination;
}

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
    imageUrl: string | null;
    options: AnswerOption[];
    trueFalseAnswer: TrueFalseAnswer | null;
    expectedAnswer: string;
    estimatedTime: string;
    timeUnit: TimeUnit;
    points: string;
}

export type QuestionIssue = 'text' | 'optionCount' | 'optionText' | 'correct' | 'expected';

export type QuestionSaveStatus = 'new' | 'dirty' | 'saved';

export interface StoredQuestion {
    id: string;
    line: number;
    question: QuizQuestion;
}
