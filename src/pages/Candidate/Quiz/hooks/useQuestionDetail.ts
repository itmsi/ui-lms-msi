import { useCallback, useState } from 'react';

import { useQuizResource } from '@/hooks/useQuizResource';
import { fetchParticipantQuestion } from '@/services/quizService';
import type { ParticipantQuestion } from '@/types/quiz';

export const useQuestionDetail = (questionId: string | null, userId: string, onLoaded: (question: ParticipantQuestion) => void) => {
    const [loaded, setLoaded] = useState<Record<string, ParticipantQuestion>>({});
    const question = questionId === null ? null : (loaded[questionId] ?? null);

    const load = useCallback(
        async (id: string, signal: AbortSignal) => {
            const outcome = await fetchParticipantQuestion(id, userId, signal);

            if (outcome.ok) {
                setLoaded((current) => ({ ...current, [id]: outcome.data }));
                onLoaded(outcome.data);
            }

            return outcome;
        },
        [onLoaded, userId],
    );

    const { state, retry } = useQuizResource(question === null && questionId !== null ? questionId : undefined, load);

    return { loaded, question, state, retry };
};
