import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    clearDraft,
    countAnswered,
    createDraft,
    findMissingRequired,
    fitDraft,
    readDraft,
    writeDraft,
} from '@/pages/Candidate/Quiz/quizModel';
import type { QuizDraft } from '@/pages/Candidate/Quiz/quizModel';
import { submitQuizAttempt } from '@/services/quizService';
import type { ParticipantQuiz, QuizAnswerValue, QuizFailureCode } from '@/types/quiz';

export type QuizPhase = 'intro' | 'answering';

export type SubmitState = { status: 'idle' } | { status: 'submitting' } | { status: 'error'; code: QuizFailureCode; message?: string };

export const resultPath = (quizId: string, attemptId: string) => `/my-quizzes/${quizId}/result/${attemptId}`;

export const useQuizSession = (quiz: ParticipantQuiz, userId: string) => {
    const navigate = useNavigate();
    const [draft, setDraft] = useState<QuizDraft | null>(() => {
        const stored = readDraft(userId, quiz.id);

        return stored === null ? null : fitDraft(stored, quiz);
    });
    const [phase, setPhase] = useState<QuizPhase>('intro');
    const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
    const submittingRef = useRef(false);

    useEffect(() => {
        if (draft !== null) {
            writeDraft(userId, quiz.id, draft);
        }
    }, [draft, quiz.id, userId]);

    const start = useCallback(() => {
        clearDraft(userId, quiz.id);
        setDraft(createDraft(quiz));
        setPhase('answering');
    }, [quiz, userId]);

    const resume = useCallback(() => {
        setPhase('answering');
    }, []);

    const setAnswer = useCallback((questionId: string, value: QuizAnswerValue) => {
        setDraft((current) => (current === null ? current : { ...current, answers: { ...current.answers, [questionId]: value } }));
    }, []);

    const goTo = useCallback(
        (index: number) => {
            const lastIndex = quiz.questions.length - 1;

            setDraft((current) => (current === null ? current : { ...current, currentIndex: Math.min(Math.max(index, 0), lastIndex) }));
        },
        [quiz.questions.length],
    );

    const submit = useCallback(async () => {
        if (draft === null || submittingRef.current) {
            return;
        }

        submittingRef.current = true;
        setSubmitState({ status: 'submitting' });

        const outcome = await submitQuizAttempt(quiz, draft.answers);

        if (outcome.ok) {
            clearDraft(userId, quiz.id);
            void navigate(resultPath(quiz.id, outcome.data.id), { replace: true });
            return;
        }

        submittingRef.current = false;
        setSubmitState({ status: 'error', code: outcome.code, message: outcome.message });
    }, [draft, navigate, quiz, userId]);

    const resetSubmit = useCallback(() => {
        setSubmitState({ status: 'idle' });
    }, []);

    const answers = draft?.answers ?? {};

    return {
        phase,
        draft,
        answeredCount: countAnswered(quiz.questions, answers),
        missingRequired: findMissingRequired(quiz.questions, answers),
        submitState,
        start,
        resume,
        setAnswer,
        goTo,
        submit,
        resetSubmit,
    };
};
