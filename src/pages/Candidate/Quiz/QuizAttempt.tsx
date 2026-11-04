import { ChevronLeft, ChevronRight, ClipboardCheck, ClipboardX, FileClock, LayoutGrid, Send } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useId, useState } from 'react';
import { useParams } from 'react-router-dom';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import PageHeaderDetail from '@/components/patterns/PageHeaderDetail';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LinkButton } from '@/components/ui/LinkButton';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SheetDialog } from '@/components/ui/SheetDialog';
import { useActivityLog, useLogOnce } from '@/hooks/useActivityLog';
import { useAuth } from '@/hooks/useAuth';
import { useBackToList } from '@/hooks/useBackToList';
import { useQuizResource } from '@/hooks/useQuizResource';
import { strings } from '@/locales/id';
import { QuestionNavigator } from '@/pages/Candidate/Quiz/components/QuestionNavigator';
import { QuestionPanel } from '@/pages/Candidate/Quiz/components/QuestionPanel';
import { QuestionStepper } from '@/pages/Candidate/Quiz/components/QuestionStepper';
import { QuizIntro } from '@/pages/Candidate/Quiz/components/QuizIntro';
import { QuizFailureNotice } from '@/pages/Candidate/Quiz/components/QuizFailureNotice';
import { QuizMotionProvider } from '@/pages/Candidate/Quiz/components/QuizMotionProvider';
import { SubmitDialog } from '@/pages/Candidate/Quiz/components/SubmitDialog';
import { useQuizSession } from '@/pages/Candidate/Quiz/hooks/useQuizSession';
import { MY_QUIZ_LIST_PATH, myQuizResultPath } from '@/pages/Candidate/Quiz/utils/paths';
import { PRESSABLE_CLASS, questionSlideVariants } from '@/pages/Candidate/Quiz/utils/quizMotion';
import { describeFailure, formatAnsweredCount } from '@/pages/Candidate/Quiz/utils/quizText';
import { fetchParticipantQuiz } from '@/services/quizService';
import type { ParticipantQuiz } from '@/types/quiz';
import { toHttpsUrl } from '@/utils/httpsUrl';

const NO_FILES: readonly File[] = [];

const AttemptSkeleton = () => (
    <LoadingBlock label={strings.common.loading}>
        <Card className="flex flex-col gap-5 p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 2 }, (_, index) => (
                    <Skeleton key={index} className="h-14 rounded-lg" />
                ))}
            </div>
            <Skeleton className="h-4 w-40" />
            {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-4 w-full max-w-lg" />
            ))}
            <Skeleton className="ml-auto h-11 w-36 rounded-lg" />
        </Card>
    </LoadingBlock>
);

const QuestionSkeleton = () => (
    <LoadingBlock label={strings.common.loading}>
        <Card className="flex flex-col gap-5 p-5 sm:p-6">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-5 w-full max-w-lg" />
            {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-12 rounded-lg" />
            ))}
        </Card>
    </LoadingBlock>
);

const QuizSession = ({ quiz, userId }: { quiz: ParticipantQuiz; userId: string }) => {
    const session = useQuizSession(quiz, userId);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [navigatorOpen, setNavigatorOpen] = useState(false);
    const [hasNavigated, setHasNavigated] = useState(false);
    const [direction, setDirection] = useState(1);
    const navigatorTitleId = useId();

    if (session.phase === 'intro' || session.draft === null) {
        return <QuizIntro quiz={quiz} answeredCount={session.answeredCount} onStart={session.start} />;
    }

    const { draft, saveState, questionState } = session;
    const total = quiz.questions.length;
    const index = draft.currentIndex;
    const question = quiz.questions[index];
    const isLast = index === total - 1;
    const savingTarget = saveState.status === 'saving' ? saveState.target : null;

    const goTo = (target: number) => {
        setHasNavigated(true);
        setDirection(target < index ? -1 : 1);
        void session.goTo(target);
    };

    const openReview = () => {
        if (savingTarget !== null) {
            return;
        }

        if (session.submitState.status === 'error') {
            session.resetSubmit();
        }

        setReviewOpen(true);
    };

    return (
        <div className="flex flex-col gap-4">
            <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5">
                <ProgressBar
                    className="flex-1"
                    value={(session.answeredCount / total) * 100}
                    label={formatAnsweredCount(session.answeredCount, total)}
                    showValue={false}
                />
                <div className="flex gap-2 lg:hidden">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setNavigatorOpen(true)}
                        leadingIcon={<LayoutGrid aria-hidden="true" className="size-4" />}
                        className={PRESSABLE_CLASS}
                    >
                        {strings.myQuiz.openNavigator}
                    </Button>
                    <Button
                        size="sm"
                        onClick={openReview}
                        leadingIcon={<Send aria-hidden="true" className="size-4" />}
                        className={PRESSABLE_CLASS}
                    >
                        {strings.myQuiz.review}
                    </Button>
                </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
                <Card className="hidden flex-col gap-2 p-3 lg:sticky lg:top-4 lg:flex">
                    <p className="text-caption text-muted px-2 pt-1 font-semibold">{strings.myQuiz.openNavigator}</p>
                    <div className="max-h-[calc(100dvh-16rem)] overflow-y-auto">
                        <QuestionStepper
                            questions={quiz.questions}
                            answeredIds={session.answeredIds}
                            currentIndex={index}
                            onSelect={goTo}
                        />
                    </div>
                </Card>

                <div className="flex min-w-0 flex-col gap-4">
                    <div className="overflow-x-clip">
                        <AnimatePresence mode="wait" initial={false} custom={direction}>
                            <m.div
                                key={question.id}
                                custom={direction}
                                variants={questionSlideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                            >
                                {session.question !== null ? (
                                    <QuestionPanel
                                        question={session.question}
                                        index={index}
                                        total={total}
                                        options={session.question.options}
                                        value={draft.answers[question.id]}
                                        onChange={(value) => session.setAnswer(question.id, value)}
                                        attachments={session.attachments[question.id] ?? NO_FILES}
                                        onChangeAttachments={(files) => session.setQuestionAttachments(question.id, files)}
                                        savedFileUrl={toHttpsUrl(draft.saved[question.id]?.files)}
                                        focusOnMount={hasNavigated}
                                    />
                                ) : questionState.status === 'error' ? (
                                    <Card>
                                        <ApiErrorState
                                            code={questionState.code === 'not_found' ? 'unknown' : questionState.code}
                                            message={questionState.message}
                                            unauthorizedTitle={strings.myQuiz.unauthorizedTitle}
                                            onRetry={session.retryQuestion}
                                        />
                                    </Card>
                                ) : (
                                    <QuestionSkeleton />
                                )}
                            </m.div>
                        </AnimatePresence>
                    </div>

                    {saveState.status === 'error' ? (
                        <QuizFailureNotice
                            title={strings.myQuiz.saveFailedTitle}
                            body={`${describeFailure(saveState.code, saveState.message)} ${strings.myQuiz.saveFailedKeep}`}
                            action={
                                <Button variant="secondary" size="sm" onClick={() => void session.goTo(saveState.target)}>
                                    {strings.common.retry}
                                </Button>
                            }
                        />
                    ) : null}
                    <AnimatePresence mode="wait" initial={false} custom={direction}>
                        <m.div
                            key={question.id}
                            custom={direction}
                            variants={questionSlideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => goTo(index - 1)}
                                    disabled={index === 0 || savingTarget !== null}
                                    loading={savingTarget !== null && savingTarget < index}
                                    loadingLabel={strings.myQuiz.saving}
                                    leadingIcon={<ChevronLeft aria-hidden="true" className="size-4" />}
                                    className={PRESSABLE_CLASS}
                                >
                                    {strings.myQuiz.previous}
                                </Button>
                                {isLast ? (
                                    <Button
                                        onClick={openReview}
                                        trailingIcon={<Send aria-hidden="true" className="size-4" />}
                                        className={PRESSABLE_CLASS}
                                    >
                                        {strings.myQuiz.review}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => goTo(index + 1)}
                                        disabled={savingTarget !== null}
                                        loading={savingTarget !== null && savingTarget > index}
                                        loadingLabel={strings.myQuiz.saving}
                                        trailingIcon={<ChevronRight aria-hidden="true" className="size-4" />}
                                        className={PRESSABLE_CLASS}
                                    >
                                        {strings.myQuiz.next}
                                    </Button>
                                )}
                            </div>
                        </m.div>
                    </AnimatePresence>
                </div>
            </div>

            <SheetDialog open={navigatorOpen} onClose={() => setNavigatorOpen(false)} labelledBy={navigatorTitleId}>
                <h2 id={navigatorTitleId} className="text-card font-sans">
                    {strings.myQuiz.openNavigator}
                </h2>
                <QuestionNavigator
                    questions={quiz.questions}
                    answeredIds={session.answeredIds}
                    currentIndex={index}
                    onSelect={(target) => {
                        setNavigatorOpen(false);
                        goTo(target);
                    }}
                />
            </SheetDialog>

            <SubmitDialog
                open={reviewOpen}
                answered={session.answeredCount}
                total={total}
                unanswered={session.unanswered}
                submitState={session.submitState}
                onClose={() => setReviewOpen(false)}
                onJump={(target) => {
                    setReviewOpen(false);
                    goTo(target);
                }}
                onSubmit={() => void session.submit()}
            />
        </div>
    );
};

const CompletedQuiz = ({ quiz, onBack }: { quiz: ParticipantQuiz; onBack: () => void }) => (
    <Card>
        <EmptyState
            icon={ClipboardCheck}
            title={strings.myQuiz.completedTitle}
            description={strings.myQuiz.completedBody}
            action={
                <div className="flex flex-wrap justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={onBack}>
                        {strings.myQuiz.backToList}
                    </Button>
                    <LinkButton to={myQuizResultPath(quiz.id)} size="sm" leadingIcon={<FileClock aria-hidden="true" className="size-4" />}>
                        {strings.myQuiz.viewScore}
                    </LinkButton>
                </div>
            }
        />
    </Card>
);

export const QuizAttempt = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const { user } = useAuth();
    const { state, retry } = useQuizResource(quizId, fetchParticipantQuiz);
    const backToList = useBackToList(MY_QUIZ_LIST_PATH);
    const activity = useActivityLog();

    const quiz = state.status === 'success' ? state.data : null;
    const isCompleted = quiz?.isCompleted === true;
    const isMissing =
        (state.status === 'error' && state.code === 'not_found') || (quiz !== null && isCompleted === false && quiz.questions.length === 0);

    useLogOnce(quiz !== null && isMissing === false ? quiz.id : null, () => {
        if (quiz !== null) {
            activity.quizOpened(quiz.title);
        }
    });

    return (
        <QuizMotionProvider>
            <section className="flex flex-col gap-5">
                <PageHeaderDetail
                    title={quiz?.title ?? strings.nav.myQuiz}
                    subtitle={quiz === null ? null : `${strings.myQuiz.materialPrefix} ${quiz.moduleTitle}`}
                    backPath={backToList}
                />

                {state.status === 'loading' ? <AttemptSkeleton /> : null}

                {isMissing ? (
                    <Card>
                        <EmptyState
                            icon={ClipboardX}
                            title={strings.myQuiz.notFoundTitle}
                            description={strings.myQuiz.notFoundBody}
                            action={
                                <Button size="sm" variant="secondary" onClick={backToList}>
                                    {strings.myQuiz.backToList}
                                </Button>
                            }
                        />
                    </Card>
                ) : null}

                {state.status === 'error' && state.code !== 'not_found' ? (
                    <Card>
                        <ApiErrorState
                            code={state.code}
                            message={state.message}
                            unauthorizedTitle={strings.myQuiz.unauthorizedTitle}
                            onRetry={retry}
                        />
                    </Card>
                ) : null}

                {quiz !== null && isCompleted ? <CompletedQuiz quiz={quiz} onBack={backToList} /> : null}

                {quiz !== null && isCompleted === false && isMissing === false ? (
                    <QuizSession key={quiz.id} quiz={quiz} userId={user?.id ?? ''} />
                ) : null}
            </section>
        </QuizMotionProvider>
    );
};

export default QuizAttempt;
