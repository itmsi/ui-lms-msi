import type { AnswerOption, QuestionIssue, QuestionType, QuizQuestion } from '@/pages/QuizMaterials/types';

export const MIN_CHOICE_OPTIONS = 2;

const createKey = (): string => crypto.randomUUID();

export const createOption = (): AnswerOption => ({ key: createKey(), text: '', isCorrect: false });

export const createQuestion = (): QuizQuestion => ({
    key: createKey(),
    type: 'multiple_choice',
    text: '',
    image: null,
    options: [createOption(), createOption()],
    trueFalseAnswer: null,
    expectedAnswer: '',
    estimatedTime: '',
    timeUnit: 'minutes',
    points: '',
});

export const duplicateQuestion = (question: QuizQuestion): QuizQuestion => ({
    ...question,
    key: createKey(),
    options: question.options.map((option) => ({ ...option, key: createKey() })),
});

export const changeQuestionType = (question: QuizQuestion, type: QuestionType): QuizQuestion => {
    if (type !== 'multiple_choice') {
        return { ...question, type };
    }

    const firstCorrect = question.options.find((option) => option.isCorrect)?.key ?? null;

    return {
        ...question,
        type,
        options: question.options.map((option) => ({ ...option, isCorrect: option.key === firstCorrect })),
    };
};

const isChoiceType = (type: QuestionType): boolean => type === 'multiple_choice' || type === 'multiple_answers';

export const findIssues = (question: QuizQuestion): QuestionIssue[] => {
    const issues: QuestionIssue[] = [];

    if (question.text.trim() === '') {
        issues.push('text');
    }

    if (isChoiceType(question.type)) {
        if (question.options.length < MIN_CHOICE_OPTIONS) {
            issues.push('optionCount');
        }

        if (question.options.some((option) => option.text.trim() === '')) {
            issues.push('optionText');
        }

        if (question.options.some((option) => option.isCorrect) === false) {
            issues.push('correct');
        }
    }

    if (question.type === 'true_false' && question.trueFalseAnswer === null) {
        issues.push('correct');
    }

    if (question.type === 'short_answer' && question.expectedAnswer.trim() === '') {
        issues.push('expected');
    }

    return issues;
};

export const hasQuestionContent = (question: QuizQuestion): boolean =>
    question.text.trim() !== '' ||
    question.image !== null ||
    question.expectedAnswer.trim() !== '' ||
    question.options.some((option) => option.text.trim() !== '');
