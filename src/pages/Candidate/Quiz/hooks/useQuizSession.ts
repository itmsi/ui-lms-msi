import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useActivityLog } from '@/hooks/useActivityLog';
import { useQuestionDetail } from '@/pages/Candidate/Quiz/hooks/useQuestionDetail';
import type { QuizDraft, SavedAnswer } from '@/pages/Candidate/Quiz/types';
import {
    createDraft,
    findAnsweredIds,
    findUnanswered,
    isAnsweredOnServer,
    isFinalAnswer,
    isSameSavedAnswer,
    restoreSavedAnswer,
    toAnswerEntries,
    toSavedAnswer,
} from '@/pages/Candidate/Quiz/utils/quizModel';
import { myQuizResultPath } from '@/pages/Candidate/Quiz/utils/paths';
import { saveQuizAnswer } from '@/services/quizService';
import type { ParticipantQuestion, ParticipantQuiz, QuizAnswerValue, QuizAttachments, QuizFailureCode, QuizOutcome } from '@/types/quiz';

export type QuizPhase = 'intro' | 'answering';

export type SubmitState = { status: 'idle' } | { status: 'submitting' } | { status: 'error'; code: QuizFailureCode; message?: string };

export type SaveState =
    | { status: 'idle' }
    | { status: 'saving'; target: number }
    | { status: 'error'; target: number; code: QuizFailureCode; message?: string };

const NO_FILES: readonly File[] = [];

export const useQuizSession = (quiz: ParticipantQuiz, userId: string) => {
    const navigate = useNavigate();
    const activity = useActivityLog();
    const submitLoggedRef = useRef(false);
    const [draft, setDraft] = useState<QuizDraft | null>(null);
    const [attachments, setAttachments] = useState<QuizAttachments>({});
    const [phase, setPhase] = useState<QuizPhase>('intro');
    const [saveState, setSaveState] = useState<SaveState>({ status: 'idle' });
    const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
    const busyRef = useRef(false);
    const restoreAnswer = useCallback((question: ParticipantQuestion) => {
        setDraft((current) => (current === null ? current : restoreSavedAnswer(current, question)));
    }, []);
    const detail = useQuestionDetail(
        phase === 'answering' && draft !== null ? quiz.questions[draft.currentIndex].id : null,
        userId,
        restoreAnswer,
    );

    const answeredIds = useMemo(
        () => findAnsweredIds(quiz.questions, draft ?? createDraft(), attachments),
        [attachments, draft, quiz.questions],
    );
    const unanswered = useMemo(() => findUnanswered(quiz.questions, answeredIds), [answeredIds, quiz.questions]);

    const start = useCallback(() => {
        setDraft({ ...createDraft(), currentIndex: unanswered.at(0) ?? 0 });
        setPhase('answering');
    }, [unanswered]);

    const setAnswer = useCallback((questionId: string, value: QuizAnswerValue) => {
        setDraft((current) => (current === null ? current : { ...current, answers: { ...current.answers, [questionId]: value } }));
    }, []);

    const setQuestionAttachments = useCallback((questionId: string, files: File[]) => {
        setAttachments((current) => ({ ...current, [questionId]: files }));
    }, []);

    const syncAnswer = useCallback(
        async (questionId: string, current: QuizDraft): Promise<QuizOutcome<SavedAnswer | null>> => {
            const value = current.answers[questionId];
            const files = attachments[questionId] ?? NO_FILES;
            const snapshot = toSavedAnswer(value, files);
            const previous = current.saved[questionId] as SavedAnswer | undefined;

            if (isSameSavedAnswer(previous, snapshot)) {
                return { ok: true, data: null };
            }

            const question = detail.loaded[questionId] ?? null;

            if (
                question === null ||
                (previous === undefined && question.hasSavedAnswer && snapshot.answer === '' && snapshot.files === '')
            ) {
                return { ok: true, data: null };
            }

            const isFinal = isFinalAnswer(questionId, quiz.questions, current, attachments);
            const saved = await saveQuizAnswer(
                questionId,
                toAnswerEntries(question, value),
                snapshot.files === (previous?.files ?? '') ? NO_FILES : files,
                isFinal ? new Date().toISOString() : null,
            );

            if (saved.ok === false) {
                return saved;
            }

            if (isFinal && submitLoggedRef.current === false) {
                submitLoggedRef.current = true;
                activity.quizSubmitted(quiz.title);
            }

            return { ok: true, data: { answer: snapshot.answer, files: snapshot.files === '' ? (previous?.files ?? '') : snapshot.files } };
        },
        [activity, attachments, detail.loaded, quiz.questions, quiz.title],
    );

    const goTo = useCallback(
        async (index: number) => {
            const target = Math.min(Math.max(index, 0), quiz.questions.length - 1);

            if (draft === null || busyRef.current || target === draft.currentIndex) {
                return;
            }

            const questionId = quiz.questions[draft.currentIndex].id;

            busyRef.current = true;
            setSaveState({ status: 'saving', target });

            const outcome = await syncAnswer(questionId, draft);

            busyRef.current = false;

            if (outcome.ok === false) {
                setSaveState({ status: 'error', target, code: outcome.code, message: outcome.message });
                return;
            }

            setSaveState({ status: 'idle' });
            setDraft((current) =>
                current === null
                    ? current
                    : {
                          ...current,
                          currentIndex: target,
                          saved: outcome.data === null ? current.saved : { ...current.saved, [questionId]: outcome.data },
                      },
            );
        },
        [draft, quiz.questions, syncAnswer],
    );

    const submit = useCallback(async () => {
        if (draft === null || busyRef.current) {
            return;
        }

        busyRef.current = true;
        setSubmitState({ status: 'submitting' });

        const savedNow: Record<string, SavedAnswer> = {};

        for (const question of quiz.questions.filter((item) => isAnsweredOnServer(item, draft, attachments) === false)) {
            const outcome = await syncAnswer(question.id, { ...draft, saved: { ...draft.saved, ...savedNow } });

            if (outcome.ok === false) {
                busyRef.current = false;
                setDraft((current) => (current === null ? current : { ...current, saved: { ...current.saved, ...savedNow } }));
                setSubmitState({ status: 'error', code: outcome.code, message: outcome.message });
                return;
            }

            if (outcome.data !== null) {
                savedNow[question.id] = outcome.data;
            }
        }

        void navigate(myQuizResultPath(quiz.id), { replace: true });
    }, [attachments, draft, navigate, quiz, syncAnswer]);

    const resetSubmit = useCallback(() => {
        setSubmitState({ status: 'idle' });
    }, []);

    return {
        phase,
        draft,
        attachments,
        answeredIds,
        answeredCount: answeredIds.size,
        unanswered,
        question: detail.question,
        questionState: detail.state,
        retryQuestion: detail.retry,
        saveState,
        submitState,
        start,
        setAnswer,
        setQuestionAttachments,
        goTo,
        submit,
        resetSubmit,
    };
};
