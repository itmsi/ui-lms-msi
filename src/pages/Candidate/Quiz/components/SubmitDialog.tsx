import { Send, TriangleAlert } from 'lucide-react';
import { m } from 'motion/react';
import { useId } from 'react';

import { Button } from '@/components/ui/Button';
import { SheetDialog } from '@/components/ui/SheetDialog';
import { strings } from '@/locales/id';
import { QuizFailureNotice } from '@/pages/Candidate/Quiz/components/QuizFailureNotice';
import type { SubmitState } from '@/pages/Candidate/Quiz/hooks/useQuizSession';
import { PRESSABLE_CLASS, reviewItemVariants, reviewListVariants } from '@/pages/Candidate/Quiz/utils/quizMotion';
import { describeFailure, formatAnsweredCount } from '@/pages/Candidate/Quiz/utils/quizText';

interface SubmitDialogProps {
    open: boolean;
    answered: number;
    total: number;
    unanswered: number[];
    submitState: SubmitState;
    onClose: () => void;
    onJump: (index: number) => void;
    onSubmit: () => void;
}

export const SubmitDialog = ({ open, answered, total, unanswered, submitState, onClose, onJump, onSubmit }: SubmitDialogProps) => {
    const titleId = useId();
    const isSubmitting = submitState.status === 'submitting';
    const hasMissing = unanswered.length > 0;

    return (
        <SheetDialog open={open} onClose={onClose} labelledBy={titleId} className="sm:max-w-md">
            <m.div variants={reviewListVariants} initial="hidden" animate="visible" className="flex flex-col gap-4">
                <m.header variants={reviewItemVariants} className="flex flex-col gap-1">
                    <h2 id={titleId} className="text-section font-sans">
                        {strings.myQuiz.submitTitle}
                    </h2>
                    <p className="text-body text-muted tabular-nums">{formatAnsweredCount(answered, total)}</p>
                </m.header>

                {hasMissing ? (
                    <m.div variants={reviewItemVariants} className="bg-warning-soft text-warning-ink flex flex-col gap-3 rounded-lg p-3.5">
                        <p className="text-body flex items-start gap-2 font-medium">
                            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                            {`${String(unanswered.length)} ${strings.myQuiz.unansweredSuffix}. ${strings.myQuiz.unansweredHint}`}
                        </p>
                        <ul className="flex flex-wrap gap-2">
                            {unanswered.map((index) => (
                                <li key={index}>
                                    <Button variant="secondary" size="sm" onClick={() => onJump(index)}>
                                        {`${strings.myQuiz.questionLabel} ${String(index + 1)}`}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </m.div>
                ) : null}

                {hasMissing ? null : (
                    <m.p variants={reviewItemVariants} className="text-body text-ink">
                        {strings.myQuiz.submitNote}
                    </m.p>
                )}

                {submitState.status === 'error' ? (
                    <QuizFailureNotice
                        title={strings.myQuiz.submitFailedTitle}
                        body={`${describeFailure(submitState.code, submitState.message)} ${strings.myQuiz.submitFailedKeep}`}
                    />
                ) : null}

                <m.footer
                    variants={reviewItemVariants}
                    className="border-line flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end"
                >
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className={PRESSABLE_CLASS}>
                        {strings.myQuiz.checkAgain}
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={hasMissing}
                        loading={isSubmitting}
                        loadingLabel={strings.myQuiz.submitting}
                        leadingIcon={<Send aria-hidden="true" className="size-4" />}
                        className={PRESSABLE_CLASS}
                    >
                        {strings.myQuiz.submit}
                    </Button>
                </m.footer>
            </m.div>
        </SheetDialog>
    );
};
