import { Check } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';

import { strings } from '@/locales/id';
import { describeQuestionState } from '@/pages/Candidate/Quiz/quizModel';
import { popIn } from '@/pages/Candidate/Quiz/quizMotion';
import type { ParticipantQuestion } from '@/types/quiz';
import { cn } from '@/utils/cn';

interface QuestionNavigatorProps {
    questions: readonly ParticipantQuestion[];
    answeredIds: ReadonlySet<string>;
    currentIndex: number;
    onSelect: (index: number) => void;
}

export const QuestionNavigator = ({ questions, answeredIds, currentIndex, onSelect }: QuestionNavigatorProps) => (
    <nav aria-label={strings.myQuiz.navigatorLabel} className="flex flex-col gap-4">
        <ol className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
                const answered = answeredIds.has(question.id);
                const current = index === currentIndex;

                return (
                    <li key={question.id}>
                        <button
                            type="button"
                            onClick={() => onSelect(index)}
                            aria-label={describeQuestionState(index, answered)}
                            aria-current={current ? 'step' : undefined}
                            className={cn(
                                'text-body relative flex aspect-square w-full min-w-10 items-center justify-center rounded-lg border font-semibold tabular-nums',
                                'transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out active:scale-[0.97]',
                                answered
                                    ? 'bg-primary-light text-primary-dark border-primary-light'
                                    : 'bg-surface border-line hover:border-primary/60',
                                answered === false && (current ? 'text-ink' : 'text-muted'),
                                current && 'ring-primary ring-2 ring-offset-2',
                            )}
                        >
                            {index + 1}
                            <AnimatePresence>
                                {answered ? (
                                    <m.span
                                        key="done"
                                        aria-hidden="true"
                                        {...popIn}
                                        className="bg-primary ring-surface absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-white ring-2"
                                    >
                                        <Check className="size-2.5" strokeWidth={3.5} />
                                    </m.span>
                                ) : null}
                            </AnimatePresence>
                        </button>
                    </li>
                );
            })}
        </ol>

        <ul aria-hidden="true" className="text-caption text-muted flex flex-wrap gap-x-3 gap-y-1">
            <li className="flex items-center gap-1.5">
                <span className="bg-primary flex size-3 items-center justify-center rounded-full text-white">
                    <Check className="size-2" strokeWidth={4} />
                </span>
                {strings.myQuiz.legendAnswered}
            </li>
            <li className="flex items-center gap-1.5">
                <span className="border-line size-3 rounded-sm border" />
                {strings.myQuiz.legendUnanswered}
            </li>
        </ul>
    </nav>
);
