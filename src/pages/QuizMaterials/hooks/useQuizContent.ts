import { useCallback, useMemo, useState } from 'react';

import {
    changeQuestionType,
    createOption,
    createQuestion,
    duplicateQuestion as cloneQuestion,
    hasQuestionContent,
} from '@/pages/QuizMaterials/questionModel';
import type { QuestionType, QuizQuestion, TrueFalseAnswer } from '@/pages/QuizMaterials/types';
import { moveItem } from '@/utils/array';

interface ContentState {
    questions: QuizQuestion[];
    selectedKey: string | null;
}

const createInitialState = (): ContentState => {
    const first = createQuestion();

    return { questions: [first], selectedKey: first.key };
};

const mapQuestion = (questions: QuizQuestion[], key: string, change: (question: QuizQuestion) => QuizQuestion): QuizQuestion[] =>
    questions.map((question) => (question.key === key ? change(question) : question));

export const useQuizContent = () => {
    const [state, setState] = useState<ContentState>(createInitialState);

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

    const deleteQuestion = useCallback((key: string) => {
        setState((current) => {
            const index = current.questions.findIndex((question) => question.key === key);

            if (index === -1) {
                return current;
            }

            const questions = current.questions.filter((question) => question.key !== key);
            const neighbour = questions[index] ?? questions[index - 1];

            return {
                ...current,
                questions,
                selectedKey: current.selectedKey === key ? (neighbour?.key ?? null) : current.selectedKey,
            };
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

    const hasContent = useMemo(() => state.questions.some(hasQuestionContent), [state.questions]);

    return {
        questions: state.questions,
        selectedKey: state.selectedKey,
        hasContent,
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
    };
};

export type QuizContentController = ReturnType<typeof useQuizContent>;
