import { ClipboardX } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import PageHeaderDetail from '@/components/patterns/PageHeaderDetail';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LinkButton } from '@/components/ui/LinkButton';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { useBackToList } from '@/hooks/useBackToList';
import { useBeforeUnloadWarning } from '@/hooks/useBeforeUnloadWarning';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { useNow } from '@/hooks/useNow';
import { useQuizResource } from '@/hooks/useQuizResource';
import { strings } from '@/locales/id';
import { QuizContentEditor } from '@/pages/QuizMaterials/components/content/QuizContentEditor';
import { QuizInfoEditPanel } from '@/pages/QuizMaterials/components/QuizInfoEditPanel';
import { QuizInfoSummary } from '@/pages/QuizMaterials/components/QuizInfoSummary';
import { useQuizContent } from '@/pages/QuizMaterials/hooks/useQuizContent';
import { QUIZ_LIST_PATH } from '@/pages/QuizMaterials/utils/paths';
import { fetchQuizDetail, fetchQuizQuestions } from '@/pages/QuizMaterials/services/quizMaterialService';
import type { QuizDetail as QuizDetailData, StoredQuestion } from '@/pages/QuizMaterials/types';
import type { QuizOutcome } from '@/types/quiz';
import { toIsoDate } from '@/utils/dateTime';

const NOW_TICK_MS = 60_000;

interface QuizEditorData {
    quiz: QuizDetailData;
    questions: StoredQuestion[];
}

const loadQuizEditor = async (quizId: string, signal: AbortSignal): Promise<QuizOutcome<QuizEditorData>> => {
    const [quiz, questions] = await Promise.all([fetchQuizDetail(quizId, signal), fetchQuizQuestions(quizId, signal)]);

    if (quiz.ok === false) {
        return quiz;
    }

    if (questions.ok === false) {
        return questions;
    }

    return { ok: true, data: { quiz: quiz.data, questions: questions.data } };
};

const DetailSkeleton = () => (
    <LoadingBlock label={strings.common.loading} className="flex flex-col gap-4">
        <Card className="flex flex-col gap-4 p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-72 max-w-full" />
            <div className="grid gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton key={index} className="h-10 w-full rounded-lg" />
                ))}
            </div>
        </Card>
        <div className="grid items-start gap-4 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)]">
            <Card className="flex flex-col gap-2 p-3">
                {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-lg" />
                ))}
            </Card>
            <Card className="flex flex-col gap-3 p-5">
                <Skeleton className="h-9 w-44 rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-11 w-full rounded-lg" />
                <Skeleton className="h-11 w-full rounded-lg" />
            </Card>
        </div>
    </LoadingBlock>
);

const QuizEditorView = ({ data, onBack }: { data: QuizEditorData; onBack: () => void }) => {
    const today = toIsoDate(new Date(useNow(NOW_TICK_MS)));
    const { canUpdate } = useMenuAccess('quizMaterials');
    const content = useQuizContent(data.quiz.id, data.questions, canUpdate);
    const [quiz, setQuiz] = useState(data.quiz);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [confirmingLeave, setConfirmingLeave] = useState(false);
    const { info } = quiz;
    const hasUnsaved = isEditingInfo || content.unsavedCount > 0;

    useBeforeUnloadWarning(hasUnsaved);

    return (
        <>
            <PageHeaderDetail
                title={strings.quizForm.detailTitle}
                subtitle={strings.quizForm.detailSubtitle}
                backPath={() => {
                    if (hasUnsaved) {
                        setConfirmingLeave(true);
                        return;
                    }

                    onBack();
                }}
            />

            {isEditingInfo ? (
                <QuizInfoEditPanel
                    quiz={quiz}
                    today={today}
                    onCancel={() => setIsEditingInfo(false)}
                    onSaved={(next) => {
                        setQuiz(next);
                        setIsEditingInfo(false);
                    }}
                />
            ) : (
                <>
                    <QuizInfoSummary info={info} today={today} onEdit={canUpdate ? () => setIsEditingInfo(true) : undefined} />
                    <QuizContentEditor content={content} readOnly={canUpdate === false} />
                </>
            )}

            <ConfirmDialog
                open={confirmingLeave}
                title={strings.quizForm.leaveEditTitle}
                description={isEditingInfo ? strings.quizForm.leaveUnsavedInfo : strings.quizForm.leaveUnsavedQuestions}
                confirmLabel={strings.quizForm.leaveConfirm}
                cancelLabel={strings.quizForm.leaveCancel}
                onConfirm={() => {
                    setConfirmingLeave(false);
                    onBack();
                }}
                onCancel={() => setConfirmingLeave(false)}
            />
        </>
    );
};

export const QuizDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { state, retry } = useQuizResource(id, loadQuizEditor);
    const backToList = useBackToList(QUIZ_LIST_PATH);

    if (state.status === 'success') {
        return (
            <section className="flex flex-col gap-5">
                <QuizEditorView key={state.data.quiz.id} data={state.data} onBack={backToList} />
            </section>
        );
    }

    return (
        <section className="flex flex-col gap-5">
            <PageHeaderDetail title={strings.quizForm.detailTitle} backPath={backToList} />

            {state.status === 'loading' ? <DetailSkeleton /> : null}

            {state.status === 'error' && state.code === 'not_found' ? (
                <Card>
                    <EmptyState
                        icon={ClipboardX}
                        title={strings.quizForm.notFoundTitle}
                        description={strings.quizForm.notFoundBody}
                        action={
                            <LinkButton to={QUIZ_LIST_PATH} size="sm" variant="secondary">
                                {strings.quizForm.backToList}
                            </LinkButton>
                        }
                    />
                </Card>
            ) : null}

            {state.status === 'error' && state.code !== 'not_found' ? (
                <Card>
                    <ApiErrorState
                        code={state.code}
                        message={state.message}
                        unauthorizedTitle={strings.quizForm.unauthorizedTitle}
                        onRetry={retry}
                    />
                </Card>
            ) : null}
        </section>
    );
};

export default QuizDetail;
