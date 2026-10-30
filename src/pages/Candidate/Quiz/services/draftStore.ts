import { isRecord } from '@/helpers/authParsers';
import type { QuizDraft } from '@/pages/Candidate/Quiz/types';
import type { QuizAnswers, QuizAnswerValue } from '@/types/quiz';

const DRAFT_PREFIX = 'msi-learning:quiz-draft';

const draftKey = (userId: string, quizId: string) => `${DRAFT_PREFIX}:${userId}:${quizId}`;

const isAnswerValue = (value: unknown): value is QuizAnswerValue =>
    typeof value === 'string' || (Array.isArray(value) && (value as unknown[]).every((item) => typeof item === 'string'));

const toAnswers = (value: unknown): QuizAnswers =>
    isRecord(value)
        ? Object.fromEntries(Object.entries(value).filter((entry): entry is [string, QuizAnswerValue] => isAnswerValue(entry[1])))
        : {};

export const readDraft = (userId: string, quizId: string): QuizDraft | null => {
    try {
        const raw = localStorage.getItem(draftKey(userId, quizId));
        const parsed: unknown = raw === null ? null : JSON.parse(raw);

        if (isRecord(parsed) === false) {
            return null;
        }

        return {
            answers: toAnswers(parsed.answers),
            currentIndex: typeof parsed.currentIndex === 'number' ? parsed.currentIndex : 0,
        };
    } catch {
        return null;
    }
};

export const writeDraft = (userId: string, quizId: string, draft: QuizDraft) => {
    try {
        localStorage.setItem(draftKey(userId, quizId), JSON.stringify(draft));
    } catch {
        return;
    }
};

export const clearDraft = (userId: string, quizId: string) => {
    try {
        localStorage.removeItem(draftKey(userId, quizId));
    } catch {
        return;
    }
};
