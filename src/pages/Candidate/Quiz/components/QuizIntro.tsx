import { ArrowRight, Asterisk, Clock, HardDriveDownload, PencilLine, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { strings } from '@/locales/id';
import { formatAnsweredCount, formatEstimate } from '@/pages/Candidate/Quiz/quizModel';
import type { ParticipantQuiz } from '@/types/quiz';
import { formatShortDate, fromIsoDate } from '@/utils/dateTime';

const RULES: { icon: LucideIcon; text: string }[] = [
    { icon: Clock, text: strings.myQuiz.ruleNoTimer },
    { icon: Asterisk, text: strings.myQuiz.ruleRequired },
    { icon: HardDriveDownload, text: strings.myQuiz.ruleSaved },
    { icon: Send, text: strings.myQuiz.ruleOnce },
];

const Fact = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-background flex flex-col gap-0.5 rounded-lg px-3 py-2.5">
        <dt className="text-caption text-muted">{label}</dt>
        <dd className="text-body text-ink font-semibold tabular-nums">{value}</dd>
    </div>
);

interface QuizIntroProps {
    quiz: ParticipantQuiz;
    draftAnswered: number | null;
    onStart: () => void;
    onResume: () => void;
}

export const QuizIntro = ({ quiz, draftAnswered, onStart, onResume }: QuizIntroProps) => {
    const [confirmingRestart, setConfirmingRestart] = useState(false);

    const total = quiz.questions.length;
    const requiredCount = quiz.questions.filter((question) => question.required).length;
    const hasAllPoints = quiz.questions.every((question) => question.points !== null);
    const totalPoints = quiz.questions.reduce((sum, question) => sum + (question.points ?? 0), 0);
    const estimate = formatEstimate(quiz.questions.reduce((sum, question) => sum + (question.estimatedSeconds ?? 0), 0));
    const endDate = fromIsoDate(quiz.endDate);

    return (
        <Card className="motion-rise flex flex-col gap-6 p-5 sm:p-6">
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Fact
                    label={strings.myQuiz.factQuestions}
                    value={`${String(total)} ${strings.myQuiz.questionsSuffix} · ${String(requiredCount)} ${strings.myQuiz.requiredSuffix}`}
                />
                <Fact label={strings.myQuiz.factEstimate} value={estimate ?? strings.myQuiz.noEstimate} />
                {hasAllPoints ? (
                    <Fact label={strings.myQuiz.factPoints} value={`${String(totalPoints)} ${strings.myQuiz.pointsSuffix}`} />
                ) : null}
                <Fact label={strings.myQuiz.validUntil} value={endDate === undefined ? '—' : formatShortDate(endDate)} />
            </dl>

            <div className="flex flex-col gap-3">
                <h2 className="text-card font-sans">{strings.myQuiz.introHeading}</h2>
                <ul className="flex flex-col gap-2.5">
                    {RULES.map(({ icon: Icon, text }) => (
                        <li key={text} className="text-body text-ink flex items-start gap-3">
                            <span
                                aria-hidden="true"
                                className="bg-primary-light text-primary flex size-7 shrink-0 items-center justify-center rounded-full"
                            >
                                <Icon className="size-3.5" />
                            </span>
                            <span className="pt-0.5">{text}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {draftAnswered === null ? null : (
                <p className="bg-primary-light text-primary-dark text-body flex items-center gap-2 rounded-lg px-3 py-2.5">
                    <PencilLine aria-hidden="true" className="size-4 shrink-0" />
                    {`${strings.myQuiz.draftFound}: ${formatAnsweredCount(draftAnswered, total)}.`}
                </p>
            )}

            <div className="border-line flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
                {draftAnswered === null ? (
                    <Button onClick={onStart} trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}>
                        {strings.myQuiz.start}
                    </Button>
                ) : (
                    <>
                        <Button variant="secondary" onClick={() => setConfirmingRestart(true)}>
                            {strings.myQuiz.startOver}
                        </Button>
                        <Button onClick={onResume} trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}>
                            {strings.myQuiz.resume}
                        </Button>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={confirmingRestart}
                title={strings.myQuiz.startOverTitle}
                description={strings.myQuiz.startOverBody}
                confirmLabel={strings.myQuiz.startOverConfirm}
                cancelLabel={strings.common.cancel}
                confirmVariant="danger"
                onConfirm={() => {
                    setConfirmingRestart(false);
                    onStart();
                }}
                onCancel={() => setConfirmingRestart(false)}
            />
        </Card>
    );
};
