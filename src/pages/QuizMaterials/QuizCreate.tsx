import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeaderDetail from '@/components/patterns/PageHeaderDetail';
import { PermissionDenied } from '@/components/patterns/PermissionDenied';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useBeforeUnloadWarning } from '@/hooks/useBeforeUnloadWarning';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { useNow } from '@/hooks/useNow';
import { strings } from '@/locales/id';
import { QuizInfoForm } from '@/pages/QuizMaterials/components/QuizInfoForm';
import { EMPTY_QUIZ_INFO, useQuizDraft } from '@/pages/QuizMaterials/hooks/useQuizDraft';
import { QUIZ_LIST_PATH, quizDetailPath } from '@/pages/QuizMaterials/utils/paths';
import { createQuiz } from '@/pages/QuizMaterials/services/quizMaterialService';
import { toIsoDate } from '@/utils/dateTime';

const NOW_TICK_MS = 60_000;

export const QuizCreate = () => {
    const navigate = useNavigate();
    const { canCreate } = useMenuAccess('quizMaterials');
    const today = toIsoDate(new Date(useNow(NOW_TICK_MS)));
    const openDetail = useCallback((quizId: string) => void navigate(quizDetailPath(quizId), { replace: true }), [navigate]);
    const { info, errors, isSubmitting, update, setBanner, submit, isDirty } = useQuizDraft({
        today,
        initial: EMPTY_QUIZ_INFO,
        save: createQuiz,
        successMessage: strings.quizForm.saved,
        onSaved: openDetail,
    });
    const [confirmingLeave, setConfirmingLeave] = useState(false);

    useBeforeUnloadWarning(isDirty && isSubmitting === false);

    const leave = useCallback(() => {
        void navigate(QUIZ_LIST_PATH);
    }, [navigate]);

    const requestLeave = useCallback(() => {
        if (isDirty) {
            setConfirmingLeave(true);
            return;
        }

        leave();
    }, [isDirty, leave]);

    return (
        <section className="flex flex-col gap-5">
            <PageHeaderDetail title={strings.quizForm.createTitle} subtitle={strings.quizForm.createSubtitle} backPath={requestLeave} />

            {canCreate ? (
                <QuizInfoForm
                    mode="create"
                    info={info}
                    errors={errors}
                    minDate={today}
                    isSubmitting={isSubmitting}
                    onChange={update}
                    onChangeBanner={setBanner}
                    onSubmit={() => void submit()}
                    onCancel={requestLeave}
                />
            ) : (
                <PermissionDenied description={strings.permission.createQuiz} />
            )}

            <ConfirmDialog
                open={confirmingLeave}
                title={strings.quizForm.leaveTitle}
                description={strings.quizForm.leaveBody}
                confirmLabel={strings.quizForm.leaveConfirm}
                cancelLabel={strings.quizForm.leaveCancel}
                onConfirm={leave}
                onCancel={() => setConfirmingLeave(false)}
            />
        </section>
    );
};

export default QuizCreate;
