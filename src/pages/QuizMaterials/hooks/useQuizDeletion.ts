import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { strings } from '@/locales/id';
import { deleteQuiz } from '@/pages/QuizMaterials/services/quizMaterialService';
import type { QuizListItem } from '@/pages/QuizMaterials/types';
import { toFailureMessage } from '@/utils/failureMessage';
import type { FailureMessages } from '@/utils/failureMessage';

const DELETE_MESSAGES: FailureMessages = {
    unauthorized: strings.quizMaterials.deleteUnauthorized,
    offline: strings.quizMaterials.deleteOffline,
    fallback: strings.quizMaterials.deleteFailed,
};

export const useQuizDeletion = (onDeleted: (quiz: QuizListItem) => void) => {
    const [pending, setPending] = useState<QuizListItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const deletingRef = useRef(false);

    const cancel = useCallback(() => {
        if (deletingRef.current === false) {
            setPending(null);
        }
    }, []);

    const confirm = useCallback(async () => {
        if (pending === null || deletingRef.current) {
            return;
        }

        deletingRef.current = true;
        setIsDeleting(true);

        const outcome = await deleteQuiz(pending.id);

        deletingRef.current = false;
        setIsDeleting(false);

        if (outcome.ok === false) {
            toast.error(toFailureMessage(outcome, DELETE_MESSAGES));
            return;
        }

        toast.success(strings.quizMaterials.deleted);
        setPending(null);
        onDeleted(pending);
    }, [onDeleted, pending]);

    return { pending, isDeleting, request: setPending, cancel, confirm };
};
