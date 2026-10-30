import type { QuizDraft } from '@/pages/Candidate/Quiz/types';
import type { ParticipantQuestion, ParticipantQuiz, QuizAnswers, QuizAnswerValue, QuizAttachments } from '@/types/quiz';
import { htmlToPlainText } from '@/utils/htmlText';

export const isAnsweredValue = (value: QuizAnswerValue | undefined): boolean =>
    value === undefined ? false : Array.isArray(value) ? value.length > 0 : value.trim() !== '';

const hasAnswer = (question: ParticipantQuestion, value: QuizAnswerValue | undefined): boolean =>
    question.type === 'short_answer' ? typeof value === 'string' && htmlToPlainText(value) !== '' : isAnsweredValue(value);

export const findAnsweredIds = (
    questions: readonly ParticipantQuestion[],
    answers: QuizAnswers,
    attachments: QuizAttachments,
): ReadonlySet<string> =>
    new Set(
        questions
            .filter((question) => hasAnswer(question, answers[question.id]) || (attachments[question.id]?.length ?? 0) > 0)
            .map((question) => question.id),
    );

export const findUnanswered = (questions: readonly ParticipantQuestion[], answeredIds: ReadonlySet<string>): number[] =>
    questions.flatMap((question, index) => (answeredIds.has(question.id) ? [] : [index]));

export const fitAttachments = (attachments: QuizAttachments, quiz: ParticipantQuiz): QuizAttachments => {
    const questionIds = new Set(quiz.questions.filter((question) => question.type === 'short_answer').map((question) => question.id));

    return Object.fromEntries(Object.entries(attachments).filter(([questionId, files]) => questionIds.has(questionId) && files.length > 0));
};

export const countDraftAnswers = (draft: QuizDraft | null): number =>
    draft === null ? 0 : Object.values(draft.answers).filter((value) => isAnsweredValue(value)).length;

export const createDraft = (): QuizDraft => ({ answers: {}, currentIndex: 0 });

export const fitDraft = (draft: QuizDraft, quiz: ParticipantQuiz): QuizDraft => {
    const questionIds = new Set(quiz.questions.map((question) => question.id));

    return {
        ...draft,
        answers: Object.fromEntries(Object.entries(draft.answers).filter(([questionId]) => questionIds.has(questionId))),
        currentIndex: Math.min(Math.max(draft.currentIndex, 0), Math.max(quiz.questions.length - 1, 0)),
    };
};
