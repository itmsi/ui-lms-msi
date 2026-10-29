import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeaderDetail from '@/components/patterns/PageHeaderDetail';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useNow } from '@/hooks/useNow';
import { strings } from '@/locales/id';
import { QuizContentEditor } from '@/pages/QuizMaterials/components/content/QuizContentEditor';
import { QuizInfoForm } from '@/pages/QuizMaterials/components/QuizInfoForm';
import { QuizInfoSummary } from '@/pages/QuizMaterials/components/QuizInfoSummary';
import { useQuizContent } from '@/pages/QuizMaterials/hooks/useQuizContent';
import { useQuizDraft } from '@/pages/QuizMaterials/hooks/useQuizDraft';
import { toIsoDate } from '@/utils/dateTime';

const NOW_TICK_MS = 60_000;
const LIST_PATH = '/quizzes';

export const QuizCreate = () => {
    const navigate = useNavigate();
    const today = toIsoDate(new Date(useNow(NOW_TICK_MS)));
    const { info, errors, step, update, continueToContent, editInfo, isDirty: isInfoDirty } = useQuizDraft(today);
    const content = useQuizContent();
    const [confirmingLeave, setConfirmingLeave] = useState(false);
    const isDirty = isInfoDirty || content.hasContent;

    const leave = useCallback(() => {
        void navigate(LIST_PATH);
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

            {step === 'info' ? (
                <QuizInfoForm
                    info={info}
                    errors={errors}
                    today={today}
                    onChange={update}
                    onSubmit={continueToContent}
                    onCancel={requestLeave}
                />
            ) : (
                <>
                    <QuizInfoSummary info={info} today={today} onEdit={editInfo} />
                    {/* <p role="note" className="bg-warning-soft text-warning-ink text-caption flex items-start gap-2 rounded-lg px-3 py-2.5">
                        <CloudOff aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                        {strings.quizContent.unsavedNotice}
                    </p> */}
                    <QuizContentEditor content={content} />
                </>
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
