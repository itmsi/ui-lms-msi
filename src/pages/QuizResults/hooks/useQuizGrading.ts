import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { useBeforeUnloadWarning } from '@/hooks/useBeforeUnloadWarning';
import { strings } from '@/locales/id';
import { fetchGradingAttempt, saveGradingPoints } from '@/pages/QuizResults/services/quizResultService';
import type { GradingAttempt, GradingPoints, GradingReview } from '@/pages/QuizResults/types';
import type { QuizOutcome } from '@/types/quiz';

export interface GradingRow {
    item: GradingReview;
    value: string;
    points: number | null;
    isChanged: boolean;
}

const POINTS_PATTERN = /^\d+$/;

const toDraft = (attempt: GradingAttempt): Record<string, string> =>
    Object.fromEntries(attempt.review.map((item) => [item.questionId, String(item.pointsEarned)]));

const parsePoints = (value: string, max: number): number | null => {
    const trimmed = value.trim();

    if (POINTS_PATTERN.test(trimmed) === false) {
        return null;
    }

    const parsed = Number.parseInt(trimmed, 10);

    return parsed <= max ? parsed : null;
};

const failureMessage = (outcome: Extract<QuizOutcome<unknown>, { ok: false }>): string => {
    if (outcome.code === 'validation' && outcome.message !== undefined) {
        return outcome.message;
    }

    if (outcome.code === 'unauthorized') {
        return strings.quizResults.saveUnauthorized;
    }

    return outcome.code === 'offline' ? strings.quizResults.saveOffline : strings.quizResults.saveFailed;
};

export const useQuizGrading = (initial: GradingAttempt, resultId: string, onReload: () => void) => {
    const [saved, setSaved] = useState(initial);
    const [draft, setDraft] = useState(() => toDraft(initial));
    const [isSaving, setIsSaving] = useState(false);
    const savingRef = useRef(false);
    const rows: GradingRow[] = saved.review.map((item) => {
        const value = draft[item.questionId] ?? String(item.pointsEarned);

        return {
            item,
            value,
            points: parsePoints(value, item.points),
            isChanged: value.trim() !== String(item.pointsEarned),
        };
    });
    const changes: GradingPoints = Object.fromEntries(
        rows.flatMap((row) =>
            row.points !== null && row.points !== row.item.pointsEarned
                ? [[row.item.quizAnswerId, row.points]]
                : [],
        ),
    );

    const hasErrors = rows.some((row) => row.points === null);
    const changedCount = rows.filter((row) => row.isChanged).length;
    const isDirty = changedCount > 0;
    const draftScore = rows.reduce((total, row) => total + (row.points ?? row.item.pointsEarned), 0);

    useBeforeUnloadWarning(isDirty);

    const setPoints = useCallback((questionId: string, value: string) => {
        setDraft((current) => ({ ...current, [questionId]: value }));
    }, []);

    const stepPoints = useCallback((item: GradingReview, delta: number) => {
        setDraft((current) => {
            const parsed = parsePoints(current[item.questionId] ?? '', item.points);
            const base = parsed ?? item.pointsEarned;

            return { ...current, [item.questionId]: String(Math.min(Math.max(base + delta, 0), item.points)) };
        });
    }, []);

    const discard = useCallback(() => {
        setDraft(toDraft(saved));
    }, [saved]);
    const save = async () => {
        if (savingRef.current || isDirty === false) {
            return;
        }

        if (hasErrors) {
            toast.error(strings.quizResults.fixErrors);
            return;
        }

        if (Object.keys(changes).length === 0) {
            setDraft(toDraft(saved));
            return;
        }

        savingRef.current = true;
        setIsSaving(true);
        const outcome = await saveGradingPoints(saved.quizId, changes);

        if (outcome.ok === false) {
            savingRef.current = false;
            setIsSaving(false);
            toast.error(failureMessage(outcome));
            return;
        }

        toast.success(strings.quizResults.saved);

        const refreshed = await fetchGradingAttempt(resultId);

        savingRef.current = false;
        setIsSaving(false);

        if (refreshed.ok) {
            setSaved(refreshed.data);
            setDraft(toDraft(refreshed.data));
            return;
        }

        onReload();
    };

    return { saved, rows, changedCount, isDirty, draftScore, isSaving, setPoints, stepPoints, discard, save };
};
