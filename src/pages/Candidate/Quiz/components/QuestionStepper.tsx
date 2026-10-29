import { Check } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useRef } from 'react';

import { strings } from '@/locales/id';
import { describeQuestionState, isAnsweredValue } from '@/pages/Candidate/Quiz/quizModel';
import { popIn } from '@/pages/Candidate/Quiz/quizMotion';
import type { ParticipantQuestion, QuizAnswers } from '@/types/quiz';
import { cn } from '@/utils/cn';

interface QuestionStepperProps {
    questions: readonly ParticipantQuestion[];
    answers: QuizAnswers;
    currentIndex: number;
    onSelect: (index: number) => void;
}

export const QuestionStepper = ({ questions, answers, currentIndex, onSelect }: QuestionStepperProps) => {
    const listRef = useRef<HTMLOListElement>(null);

    useEffect(() => {
        listRef.current?.querySelector('[aria-current="step"]')?.scrollIntoView({ block: 'nearest' });
    }, [currentIndex]);

    return (
        <nav aria-label={strings.myQuiz.navigatorLabel}>
            <ol ref={listRef} className="flex flex-col">
                {questions.map((question, index) => {
                    const answered = isAnsweredValue(answers[question.id]);
                    const current = index === currentIndex;
                    const isLast = index === questions.length - 1;

                    return (
                        <li key={question.id} className="relative">
                            {isLast ? null : (
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'absolute top-10 -bottom-1 left-[1.3125rem] w-0.5 rounded-full transition-colors duration-300',
                                        answered ? 'bg-primary' : 'bg-line/50',
                                    )}
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => onSelect(index)}
                                aria-label={describeQuestionState(question, index, answered)}
                                aria-current={current ? 'step' : undefined}
                                className={cn(
                                    'flex w-full items-start gap-3 rounded-lg p-2 text-left',
                                    'transition-[background-color,transform] duration-200 ease-out active:scale-[0.98]',
                                    current ? 'bg-primary-light' : 'hover:bg-neutral-soft',
                                )}
                            >
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'text-caption relative flex size-7 shrink-0 items-center justify-center rounded-full font-semibold tabular-nums',
                                        'transition-[background-color,border-color,color,box-shadow] duration-200',
                                        answered
                                            ? 'bg-primary border-primary border text-white'
                                            : current
                                              ? 'border-primary text-primary bg-surface border-2'
                                              : 'border-line text-muted bg-surface border',
                                        current && 'ring-primary/25 ring-4',
                                    )}
                                >
                                    <AnimatePresence initial={false}>
                                        {answered ? (
                                            <m.span key="done" {...popIn} className="absolute inset-0 flex items-center justify-center">
                                                <Check className="size-3.5" strokeWidth={3} />
                                            </m.span>
                                        ) : (
                                            <m.span key="number" {...popIn} className="absolute inset-0 flex items-center justify-center">
                                                {index + 1}
                                            </m.span>
                                        )}
                                    </AnimatePresence>
                                </span>

                                <span aria-hidden="true" className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
                                    <span
                                        className={cn(
                                            'text-body flex items-center gap-1.5 transition-colors duration-200',
                                            current ? 'text-ink font-semibold' : 'text-muted font-medium',
                                        )}
                                    >
                                        {`${strings.myQuiz.questionLabel} ${String(index + 1)}`}
                                        {question.required && answered === false ? (
                                            <span className="bg-warning size-1.5 rounded-full" />
                                        ) : null}
                                    </span>
                                    <span
                                        className={cn(
                                            'text-caption line-clamp-1 transition-colors duration-200',
                                            current ? 'text-ink/80' : 'text-muted',
                                        )}
                                    >
                                        {question.text}
                                    </span>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};
