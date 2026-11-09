import { useCallback, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { strings } from '@/locales/id';
import {
    changeQuestionType,
    createOption,
    createQuestion,
    duplicateQuestion as cloneQuestion,
    findIssues,
    hasQuestionContent,
    isChoiceType,
} from '@/pages/QuizMaterials/utils/questionModel';
import {
    createQuizQuestion,
    deleteQuizQuestion,
    fetchQuizQuestions,
    toQuestionFields,
    updateQuizQuestion,
} from '@/pages/QuizMaterials/services/quizMaterialService';
import type { QuestionSaveStatus, QuestionType, QuizQuestion, StoredQuestion, TrueFalseAnswer } from '@/pages/QuizMaterials/types';
import { moveItem } from '@/utils/array';
import { toFailureMessage } from '@/utils/failureMessage';
import type { FailureMessages } from '@/utils/failureMessage';

interface SavedQuestion {
    id: string;
    line: number;
    signature: string;
    imageUrl: string | null;
    uploaded: File | null;
}

interface ContentState {
    questions: QuizQuestion[];
    selectedKey: string | null;
    saved: Record<string, SavedQuestion>;
}

const UNORDERED_LINE = 0;

const mapQuestion = (questions: QuizQuestion[], key: string, change: (question: QuizQuestion) => QuizQuestion): QuizQuestion[] =>
    questions.map((question) => (question.key === key ? change(question) : question));

const contentSignature = (question: QuizQuestion): string => JSON.stringify(toQuestionFields(question, UNORDERED_LINE));

const isContentClean = (question: QuizQuestion, saved: SavedQuestion): boolean =>
    (question.image ?? question.imageUrl) === (saved.uploaded ?? saved.imageUrl) && contentSignature(question) === saved.signature;

const isServerOrderKept = (questions: QuizQuestion[], saved: Record<string, SavedQuestion>): boolean => {
    const lines = questions.flatMap((question) => {
        const snapshot = saved[question.key];

        return snapshot === undefined ? [] : [snapshot.line];
    });

    return lines.every((line, index) => index === 0 || line > (lines[index - 1] ?? line));
};

const resolveStatus = (question: QuizQuestion, index: number, saved: SavedQuestion | undefined, orderKept: boolean): QuestionSaveStatus => {
    if (saved === undefined) {
        return 'new';
    }

    if (isContentClean(question, saved) === false) {
        return 'dirty';
    }

    return orderKept || saved.line === index + 1 ? 'saved' : 'dirty';
};

const toSnapshot = (stored: StoredQuestion): SavedQuestion => ({
    id: stored.id,
    line: stored.line,
    signature: contentSignature(stored.question),
    imageUrl: stored.question.imageUrl,
    uploaded: null,
});

const createInitialState = (stored: StoredQuestion[], startWithBlank: boolean): ContentState => {
    if (stored.length === 0 && startWithBlank === false) {
        return { questions: [], selectedKey: null, saved: {} };
    }

    if (stored.length === 0) {
        const first = createQuestion();

        return { questions: [first], selectedKey: first.key, saved: {} };
    }

    const questions = stored.map((item) => item.question);

    return {
        questions,
        selectedKey: questions[0]?.key ?? null,
        saved: Object.fromEntries(stored.map((item) => [item.question.key, toSnapshot(item)])),
    };
};

const adoptStored = (local: QuizQuestion, stored: StoredQuestion): QuizQuestion => {
    const server = stored.question;

    return {
        ...local,
        type: server.type,
        text: server.text,
        image: null,
        imageUrl: server.imageUrl,
        estimatedTime: server.estimatedTime,
        timeUnit: server.timeUnit,
        points: server.points,
        options: isChoiceType(server.type)
            ? server.options.map((option, index) => ({ ...option, key: local.options[index]?.key ?? option.key }))
            : local.options,
        trueFalseAnswer: server.type === 'true_false' ? server.trueFalseAnswer : local.trueFalseAnswer,
        expectedAnswer: server.type === 'short_answer' ? server.expectedAnswer : local.expectedAnswer,
    };
};

const reconcile = (current: ContentState, items: StoredQuestion[]): ContentState => {
    const byId = new Map(items.map((item) => [item.id, item]));
    const saved = { ...current.saved };
    let changed = false;

    const questions = current.questions.map((question) => {
        const snapshot = current.saved[question.key];
        const stored = snapshot === undefined ? undefined : byId.get(snapshot.id);

        if (snapshot === undefined || stored === undefined) {
            return question;
        }

        changed = true;
        saved[question.key] = toSnapshot(stored);

        if (isContentClean(question, snapshot)) {
            return adoptStored(question, stored);
        }

        return question.image !== null && question.image === snapshot.uploaded
            ? { ...question, image: null, imageUrl: stored.question.imageUrl }
            : question;
    });

    return changed ? { ...current, questions, saved } : current;
};

const withoutQuestion = (current: ContentState, key: string): ContentState => {
    const index = current.questions.findIndex((question) => question.key === key);

    if (index === -1) {
        return current;
    }

    const questions = current.questions.filter((question) => question.key !== key);
    const neighbour = questions[index] ?? questions[index - 1];

    return {
        questions,
        selectedKey: current.selectedKey === key ? (neighbour?.key ?? null) : current.selectedKey,
        saved: Object.fromEntries(Object.entries(current.saved).filter(([savedKey]) => savedKey !== key)),
    };
};

const SAVE_MESSAGES: FailureMessages = {
    unauthorized: strings.quizContent.saveUnauthorized,
    offline: strings.quizContent.saveOffline,
    fallback: strings.quizContent.saveFailed,
};

const DELETE_MESSAGES: FailureMessages = {
    unauthorized: strings.quizContent.deleteUnauthorized,
    offline: strings.quizContent.deleteOffline,
    fallback: strings.quizContent.deleteFailed,
};

export const useQuizContent = (quizId: string, initialQuestions: StoredQuestion[], startWithBlank: boolean) => {
    const [state, setState] = useState<ContentState>(() => createInitialState(initialQuestions, startWithBlank));
    const [savingKeys, setSavingKeys] = useState<ReadonlySet<string>>(() => new Set());
    const [deletingKeys, setDeletingKeys] = useState<ReadonlySet<string>>(() => new Set());
    const savingRef = useRef(new Set<string>());
    const deletingRef = useRef(new Set<string>());

    const editQuestion = useCallback((key: string, change: (question: QuizQuestion) => QuizQuestion) => {
        setState((current) => ({ ...current, questions: mapQuestion(current.questions, key, change) }));
    }, []);

    const select = useCallback((key: string) => {
        setState((current) => ({ ...current, selectedKey: key }));
    }, []);

    const addQuestion = useCallback(() => {
        const question = createQuestion();

        setState((current) => ({
            ...current,
            questions: [...current.questions, question],
            selectedKey: question.key,
        }));
    }, []);

    const duplicateQuestion = useCallback((key: string) => {
        setState((current) => {
            const index = current.questions.findIndex((question) => question.key === key);
            const source = current.questions[index];

            if (source === undefined) {
                return current;
            }

            const copy = cloneQuestion(source);
            const questions = [...current.questions];
            questions.splice(index + 1, 0, copy);

            return { ...current, questions, selectedKey: copy.key };
        });
    }, []);

    const moveQuestion = useCallback((from: number, to: number) => {
        setState((current) => ({ ...current, questions: moveItem(current.questions, from, to) }));
    }, []);

    const updateQuestion = useCallback(
        (key: string, patch: Partial<Omit<QuizQuestion, 'key' | 'type' | 'options'>>) => {
            editQuestion(key, (question) => ({ ...question, ...patch }));
        },
        [editQuestion],
    );

    const changeType = useCallback(
        (key: string, type: QuestionType) => {
            editQuestion(key, (question) => changeQuestionType(question, type));
        },
        [editQuestion],
    );

    const addOption = useCallback(
        (key: string) => {
            editQuestion(key, (question) => ({ ...question, options: [...question.options, createOption()] }));
        },
        [editQuestion],
    );

    const updateOptionText = useCallback(
        (key: string, optionKey: string, text: string) => {
            editQuestion(key, (question) => ({
                ...question,
                options: question.options.map((option) => (option.key === optionKey ? { ...option, text } : option)),
            }));
        },
        [editQuestion],
    );

    const removeOption = useCallback(
        (key: string, optionKey: string) => {
            editQuestion(key, (question) => ({
                ...question,
                options: question.options.filter((option) => option.key !== optionKey),
            }));
        },
        [editQuestion],
    );

    const moveOption = useCallback(
        (key: string, from: number, to: number) => {
            editQuestion(key, (question) => ({ ...question, options: moveItem(question.options, from, to) }));
        },
        [editQuestion],
    );

    const toggleCorrect = useCallback(
        (key: string, optionKey: string) => {
            editQuestion(key, (question) => ({
                ...question,
                options: question.options.map((option) => {
                    if (question.type === 'multiple_choice') {
                        return { ...option, isCorrect: option.key === optionKey };
                    }

                    return option.key === optionKey ? { ...option, isCorrect: option.isCorrect === false } : option;
                }),
            }));
        },
        [editQuestion],
    );

    const setTrueFalseAnswer = useCallback(
        (key: string, answer: TrueFalseAnswer) => {
            editQuestion(key, (question) => ({ ...question, trueFalseAnswer: answer }));
        },
        [editQuestion],
    );

    const refreshTicketRef = useRef(0);

    const refreshQuestions = useCallback(async () => {
        refreshTicketRef.current += 1;
        const ticket = refreshTicketRef.current;
        const outcome = await fetchQuizQuestions(quizId);

        if (outcome.ok && ticket === refreshTicketRef.current) {
            setState((current) => reconcile(current, outcome.data));
        }
    }, [quizId]);

    const saveQuestion = useCallback(
        async (key: string) => {
            const index = state.questions.findIndex((question) => question.key === key);
            const question = state.questions[index];

            if (question === undefined || savingRef.current.has(key) || deletingRef.current.has(key) || findIssues(question).length > 0) {
                return;
            }

            const previous = state.saved[key];
            const fields = toQuestionFields(question, index + 1);
            const hasNewImage = question.image !== null && question.image !== previous?.uploaded;
            const request = {
                quizId,
                fields,
                image: hasNewImage ? question.image : null,
                removeImage:
                    previous !== undefined &&
                    question.image === null &&
                    question.imageUrl === null &&
                    (previous.uploaded ?? previous.imageUrl) !== null,
            };

            savingRef.current.add(key);
            setSavingKeys(new Set(savingRef.current));

            const outcome = previous === undefined ? await createQuizQuestion(request) : await updateQuizQuestion(previous.id, request);

            savingRef.current.delete(key);
            setSavingKeys(new Set(savingRef.current));

            if (outcome.ok === false) {
                toast.error(toFailureMessage(outcome, SAVE_MESSAGES));
                return;
            }

            const { id, stored } = outcome.data;
            const sent: SavedQuestion = {
                id,
                line: index + 1,
                signature: contentSignature(question),
                imageUrl: question.image === null ? question.imageUrl : null,
                uploaded: question.image,
            };

            setState((current) => {
                const next = { ...current, saved: { ...current.saved, [key]: sent } };

                return stored === null ? next : reconcile(next, [stored]);
            });
            toast.success(`${strings.quizContent.questionPrefix} ${String(index + 1)} ${strings.quizContent.savedSuffix}`);
            void refreshQuestions();
        },
        [quizId, refreshQuestions, state],
    );

    const deleteQuestion = useCallback(
        async (key: string): Promise<boolean> => {
            if (savingRef.current.has(key) || deletingRef.current.has(key)) {
                return false;
            }

            const saved = state.saved[key];

            if (saved === undefined) {
                setState((current) => withoutQuestion(current, key));
                return true;
            }

            deletingRef.current.add(key);
            setDeletingKeys(new Set(deletingRef.current));

            const outcome = await deleteQuizQuestion(saved.id);

            deletingRef.current.delete(key);
            setDeletingKeys(new Set(deletingRef.current));

            if (outcome.ok === false) {
                toast.error(toFailureMessage(outcome, DELETE_MESSAGES));
                return false;
            }

            setState((current) => withoutQuestion(current, key));
            toast.success(strings.quizContent.deleted);
            void refreshQuestions();

            return true;
        },
        [refreshQuestions, state.saved],
    );

    const statuses = useMemo<Record<string, QuestionSaveStatus>>(() => {
        const orderKept = isServerOrderKept(state.questions, state.saved);

        return Object.fromEntries(
            state.questions.map((question, index) => [question.key, resolveStatus(question, index, state.saved[question.key], orderKept)]),
        );
    }, [state.questions, state.saved]);

    const unsavedCount = state.questions.filter(
        (question) => statuses[question.key] === 'dirty' || (statuses[question.key] === 'new' && hasQuestionContent(question)),
    ).length;

    return {
        questions: state.questions,
        selectedKey: state.selectedKey,
        statuses,
        savingKeys,
        deletingKeys,
        unsavedCount,
        select,
        addQuestion,
        duplicateQuestion,
        deleteQuestion,
        moveQuestion,
        updateQuestion,
        changeType,
        addOption,
        updateOptionText,
        removeOption,
        moveOption,
        toggleCorrect,
        setTrueFalseAnswer,
        saveQuestion,
    };
};

export type QuizContentController = ReturnType<typeof useQuizContent>;
