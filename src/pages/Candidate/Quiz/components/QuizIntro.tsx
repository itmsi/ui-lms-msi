import { ArrowRight, Clock, ListChecks, PencilLine, Save, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { strings } from '@/locales/id';
import { formatAnsweredCount } from '@/pages/Candidate/Quiz/utils/quizText';
import type { ParticipantQuiz } from '@/types/quiz';
import { formatShortDate, fromIsoDate } from '@/utils/dateTime';

const RULES: { icon: LucideIcon; text: string }[] = [
    { icon: Clock, text: strings.myQuiz.ruleNoTimer },
    { icon: ListChecks, text: strings.myQuiz.ruleAllRequired },
    { icon: Save, text: strings.myQuiz.ruleSaved },
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
    answeredCount: number;
    onStart: () => void;
}

export const QuizIntro = ({ quiz, answeredCount, onStart }: QuizIntroProps) => {
    const total = quiz.questions.length;
    const endDate = fromIsoDate(quiz.endDate);

    return (
        <Card className="motion-rise flex flex-col gap-6 p-5 sm:p-6">
            <dl className="grid grid-cols-2 gap-2">
                <Fact label={strings.myQuiz.factQuestions} value={`${String(total)} ${strings.myQuiz.questionsSuffix}`} />
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

            {answeredCount === 0 ? null : (
                <p className="bg-primary-light text-primary-dark text-body flex items-center gap-2 rounded-lg px-3 py-2.5">
                    <PencilLine aria-hidden="true" className="size-4 shrink-0" />
                    {`${strings.myQuiz.alreadyStarted}: ${formatAnsweredCount(answeredCount, total)}.`}
                </p>
            )}

            <div className="border-line flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
                <Button onClick={onStart} trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}>
                    {answeredCount === 0 ? strings.myQuiz.start : strings.myQuiz.resume}
                </Button>
            </div>
        </Card>
    );
};
