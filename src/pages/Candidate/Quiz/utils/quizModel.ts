import type { QuizDraft, SavedAnswer } from '@/pages/Candidate/Quiz/types';
import type { ParticipantQuestion, ParticipantQuestionRef, QuizAnswerEntry, QuizAnswerValue, QuizAttachments } from '@/types/quiz';
import { htmlToPlainText } from '@/utils/htmlText';

export const fileKey = (file: File) => `${file.name}:${String(file.size)}:${String(file.lastModified)}`;

const isAnsweredValue = (value: QuizAnswerValue | undefined): boolean =>
    value === undefined ? false : Array.isArray(value) ? value.length > 0 : value.trim() !== '';

const hasAnswer = (value: QuizAnswerValue | undefined): boolean =>
    typeof value === 'string' ? htmlToPlainText(value) !== '' : isAnsweredValue(value);

export const toSavedAnswer = (value: QuizAnswerValue | undefined, files: readonly File[]): SavedAnswer => ({
    answer: hasAnswer(value) ? JSON.stringify(value) : '',
    files: files.map(fileKey).join('|'),
});

export const isSameSavedAnswer = (saved: SavedAnswer | undefined, snapshot: SavedAnswer): boolean =>
    saved !== undefined && saved.answer === snapshot.answer && (snapshot.files === '' || saved.files === snapshot.files);

const isAnswered = (snapshot: SavedAnswer, saved: SavedAnswer | undefined): boolean =>
    snapshot.answer !== '' || snapshot.files !== '' || (saved?.files ?? '') !== '';

export const isAnsweredOnServer = (question: ParticipantQuestionRef, draft: QuizDraft, attachments: QuizAttachments): boolean =>
    question.isAnswered &&
    (attachments[question.id]?.length ?? 0) === 0 &&
    question.id in draft.answers === false &&
    question.id in draft.saved === false;

export const isFinalAnswer = (
    questionId: string,
    questions: readonly ParticipantQuestionRef[],
    draft: QuizDraft,
    attachments: QuizAttachments,
): boolean =>
    questions.every((question) => {
        if (question.id !== questionId && isAnsweredOnServer(question, draft, attachments)) {
            return true;
        }

        const snapshot = toSavedAnswer(draft.answers[question.id], attachments[question.id] ?? []);
        const saved = draft.saved[question.id];

        return isAnswered(snapshot, saved) && (question.id === questionId || isSameSavedAnswer(saved, snapshot));
    });

export const toAnswerEntries = (question: ParticipantQuestion, value: QuizAnswerValue | undefined): QuizAnswerEntry[] => {
    if (value === undefined || hasAnswer(value) === false) {
        return [];
    }

    const selected = Array.isArray(value) ? value : [value];

    return question.type === 'short_answer'
        ? selected.map((text, index) => ({ line: index + 1, text: text.trim() }))
        : question.options.filter((option) => selected.includes(option.id)).map(({ line, text }) => ({ line, text }));
};

const toAnswerValue = ({ type, savedEntries }: ParticipantQuestion): QuizAnswerValue | undefined => {
    if (savedEntries.length === 0) {
        return undefined;
    }

    if (type === 'short_answer') {
        return savedEntries[0].text;
    }

    const selected = savedEntries.map((entry) => String(entry.line));

    return type === 'multiple_answers' ? selected : selected[0];
};

export const restoreSavedAnswer = (draft: QuizDraft, question: ParticipantQuestion): QuizDraft => {
    const value = toAnswerValue(question);
    const isEmpty = value === undefined && question.savedFileUrl === null;

    if (isEmpty || question.id in draft.answers || question.id in draft.saved) {
        return draft;
    }

    return {
        ...draft,
        answers: value === undefined ? draft.answers : { ...draft.answers, [question.id]: value },
        saved: { ...draft.saved, [question.id]: { answer: toSavedAnswer(value, []).answer, files: question.savedFileUrl ?? '' } },
    };
};

export const findAnsweredIds = (
    questions: readonly ParticipantQuestionRef[],
    draft: QuizDraft,
    attachments: QuizAttachments,
): ReadonlySet<string> =>
    new Set(
        questions
            .filter(
                (question) =>
                    isAnsweredOnServer(question, draft, attachments) ||
                    isAnswered(toSavedAnswer(draft.answers[question.id], attachments[question.id] ?? []), draft.saved[question.id]),
            )
            .map((question) => question.id),
    );

export const findUnanswered = (questions: readonly ParticipantQuestionRef[], answeredIds: ReadonlySet<string>): number[] =>
    questions.flatMap((question, index) => (answeredIds.has(question.id) ? [] : [index]));

export const createDraft = (): QuizDraft => ({ answers: {}, currentIndex: 0, saved: {} });
