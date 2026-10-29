import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { clearAttachments, readAttachments, writeAttachments } from '@/pages/Candidate/Quiz/attachmentStore';
import {
    clearDraft,
    createDraft,
    findAnsweredIds,
    findUnanswered,
    fitAttachments,
    fitDraft,
    readDraft,
    writeDraft,
} from '@/pages/Candidate/Quiz/quizModel';
import type { QuizDraft } from '@/pages/Candidate/Quiz/quizModel';
import { submitQuizAttempt } from '@/services/quizService';
import type { ParticipantQuiz, QuizAnswerValue, QuizAttachments, QuizFailureCode } from '@/types/quiz';

export type QuizPhase = 'intro' | 'answering';

export type SubmitState = { status: 'idle' } | { status: 'submitting' } | { status: 'error'; code: QuizFailureCode; message?: string };

export const resultPath = (quizId: string, attemptId: string) => `/my-quizzes/${quizId}/result/${attemptId}`;

const NO_ATTACHMENTS: QuizAttachments = {};

export const useQuizSession = (quiz: ParticipantQuiz, userId: string) => {
    const navigate = useNavigate();
    const [draft, setDraft] = useState<QuizDraft | null>(() => {
        const stored = readDraft(userId, quiz.id);

        return stored === null ? null : fitDraft(stored, quiz);
    });
    const [attachments, setAttachments] = useState<QuizAttachments>(NO_ATTACHMENTS);
    const [phase, setPhase] = useState<QuizPhase>('intro');
    const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
    const submittingRef = useRef(false);
    const attachmentsLoadedRef = useRef(false);

    useEffect(() => {
        if (draft !== null) {
            writeDraft(userId, quiz.id, draft);
        }
    }, [draft, quiz.id, userId]);

    useEffect(() => {
        let cancelled = false;

        void readAttachments(userId, quiz.id).then((stored) => {
            if (cancelled) {
                return;
            }

            attachmentsLoadedRef.current = true;
            setAttachments((current) => (current === NO_ATTACHMENTS ? fitAttachments(stored, quiz) : current));
        });

        return () => {
            cancelled = true;
        };
    }, [quiz, userId]);

    useEffect(() => {
        if (attachmentsLoadedRef.current && attachments !== NO_ATTACHMENTS) {
            void writeAttachments(userId, quiz.id, attachments);
        }
    }, [attachments, quiz.id, userId]);

    const start = useCallback(() => {
        clearDraft(userId, quiz.id);
        void clearAttachments(userId, quiz.id);
        setDraft(createDraft());
        setAttachments({});
        setPhase('answering');
    }, [quiz, userId]);

    const resume = useCallback(() => {
        setPhase('answering');
    }, []);

    const setAnswer = useCallback((questionId: string, value: QuizAnswerValue) => {
        setDraft((current) => (current === null ? current : { ...current, answers: { ...current.answers, [questionId]: value } }));
    }, []);

    const setQuestionAttachments = useCallback((questionId: string, files: File[]) => {
        setAttachments((current) => ({ ...current, [questionId]: files }));
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

        const outcome = await submitQuizAttempt(quiz, draft.answers, attachments);

        if (outcome.ok) {
            clearDraft(userId, quiz.id);
            void clearAttachments(userId, quiz.id);
            void navigate(resultPath(quiz.id, outcome.data.id), { replace: true });
            return;
        }

        submittingRef.current = false;
        setSubmitState({ status: 'error', code: outcome.code, message: outcome.message });
    }, [attachments, draft, navigate, quiz, userId]);

    const resetSubmit = useCallback(() => {
        setSubmitState({ status: 'idle' });
    }, []);

    const answers = draft?.answers;
    const answeredIds = useMemo(() => findAnsweredIds(quiz.questions, answers ?? {}, attachments), [answers, attachments, quiz.questions]);

    return {
        phase,
        draft,
        attachments,
        answeredIds,
        answeredCount: answeredIds.size,
        unanswered: findUnanswered(quiz.questions, answeredIds),
        submitState,
        start,
        resume,
        setAnswer,
        setQuestionAttachments,
        goTo,
        submit,
        resetSubmit,
    };
};
