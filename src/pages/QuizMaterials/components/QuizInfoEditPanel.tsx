import { useCallback } from 'react';

import { strings } from '@/locales/id';
import { QuizInfoForm } from '@/pages/QuizMaterials/components/QuizInfoForm';
import { useQuizDraft } from '@/pages/QuizMaterials/hooks/useQuizDraft';
import { updateQuiz } from '@/pages/QuizMaterials/services/quizMaterialService';
import type { QuizPayload } from '@/pages/QuizMaterials/services/quizMaterialService';
import type { QuizDetail, QuizInfo } from '@/pages/QuizMaterials/types';

interface QuizInfoEditPanelProps {
    quiz: QuizDetail;
    today: string;
    onCancel: () => void;
    onSaved: (quiz: QuizDetail) => void;
}

export const QuizInfoEditPanel = ({ quiz, today, onCancel, onSaved }: QuizInfoEditPanelProps) => {
    const save = useCallback((payload: QuizPayload) => updateQuiz(quiz.id, payload), [quiz.id]);

    const handleSaved = useCallback(
        (response: QuizDetail | null, info: QuizInfo) => {
            onSaved({
                ...quiz,
                info: { ...info, title: info.title.trim(), banner: null },
                bannerUrl: response?.bannerUrl ?? (info.banner === null ? quiz.bannerUrl : null),
            });
        },
        [onSaved, quiz],
    );

    const { info, errors, isSubmitting, update, setBanner, submit } = useQuizDraft({
        today,
        initial: quiz.info,
        hasCurrentBanner: quiz.bannerUrl !== null,
        save,
        successMessage: strings.quizForm.updated,
        onSaved: handleSaved,
    });
    const originalStart = quiz.info.period?.start ?? today;

    return (
        <QuizInfoForm
            mode="edit"
            info={info}
            errors={errors}
            minDate={originalStart < today ? originalStart : today}
            currentBannerUrl={quiz.bannerUrl}
            isSubmitting={isSubmitting}
            onChange={update}
            onChangeBanner={setBanner}
            onSubmit={() => void submit()}
            onCancel={onCancel}
        />
    );
};
