import { AlertCircle, ArrowDown, ArrowUp, Copy, Plus, Trash2 } from 'lucide-react';

import { ActionMenu } from '@/components/ui/ActionMenu';
import { IconButton } from '@/components/ui/IconButton';
import { useDragReorder } from '@/hooks/useDragReorder';
import { strings } from '@/locales/id';
import { findIssues } from '@/pages/QuizMaterials/questionModel';
import type { QuizQuestion } from '@/pages/QuizMaterials/types';
import { cn } from '@/utils/cn';

const ITEM_CLASS =
    'focus-visible:outline-primary flex w-full min-w-0 items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors focus-visible:outline-2';

interface QuestionNavigationItemProps {
    question: QuizQuestion;
    index: number;
    total: number;
    active: boolean;
    onSelect: () => void;
    onDuplicate: () => void;
    onMove: (to: number) => void;
    onDelete: () => void;
}

const QuestionNavigationItem = ({
    question,
    index,
    total,
    active,
    onSelect,
    onDuplicate,
    onMove,
    onDelete,
}: QuestionNavigationItemProps) => {
    const incomplete = findIssues(question).length > 0;
    const title = question.text.trim() === '' ? strings.quizContent.untitledQuestion : question.text;

    return (
        <div className="flex items-start gap-1">
            <button
                type="button"
                onClick={onSelect}
                aria-current={active ? 'true' : undefined}
                className={cn(ITEM_CLASS, active ? 'border-primary bg-primary-light' : 'hover:bg-neutral-soft border-transparent')}
            >
                <span
                    className={cn(
                        'text-caption flex size-6 shrink-0 items-center justify-center rounded-md font-semibold tabular-nums',
                        active ? 'bg-primary text-white' : 'bg-neutral-soft text-neutral-ink',
                    )}
                >
                    {index + 1}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                    <span className={cn('text-body truncate', question.text.trim() === '' ? 'text-muted italic' : 'text-ink font-medium')}>
                        {title}
                    </span>
                    <span className="text-caption text-muted truncate">{strings.quizContent.type[question.type]}</span>
                </span>
                {incomplete ? (
                    <AlertCircle aria-label={strings.quizContent.incomplete} className="text-warning-ink mt-0.5 size-4 shrink-0" />
                ) : null}
            </button>

            <ActionMenu
                label={`${strings.quizContent.questionMenu} ${String(index + 1)}`}
                items={[
                    { label: strings.quizContent.duplicate, icon: Copy, onSelect: onDuplicate },
                    { label: strings.quizContent.moveUp, icon: ArrowUp, onSelect: () => onMove(index - 1), disabled: index === 0 },
                    {
                        label: strings.quizContent.moveDown,
                        icon: ArrowDown,
                        onSelect: () => onMove(index + 1),
                        disabled: index === total - 1,
                    },
                    { label: strings.quizContent.delete, icon: Trash2, onSelect: onDelete, tone: 'danger' },
                ]}
                className="mt-1"
            />
        </div>
    );
};

interface QuestionNavigationProps {
    questions: QuizQuestion[];
    selectedKey: string | null;
    onSelect: (key: string) => void;
    onAdd: () => void;
    onDuplicate: (key: string) => void;
    onMove: (from: number, to: number) => void;
    onDelete: (key: string) => void;
}

export const QuestionNavigation = ({ questions, selectedKey, onSelect, onAdd, onDuplicate, onMove, onDelete }: QuestionNavigationProps) => {
    const { itemProps, overIndex, dragIndex } = useDragReorder(questions.length, onMove);

    return (
        <nav aria-label={strings.quizContent.questionsHeading} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-caption text-muted font-semibold tracking-wide uppercase">
                    {`${strings.quizContent.questionsHeading} (${String(questions.length)})`}
                </h2>
                <IconButton
                    label={strings.quizContent.addQuestion}
                    icon={<Plus aria-hidden="true" className="size-4" />}
                    onClick={onAdd}
                    className="text-primary hover:bg-primary-light hover:text-primary-dark size-8"
                />
            </div>

            {questions.length === 0 ? (
                <p className="text-caption text-muted">{strings.quizContent.emptyBody}</p>
            ) : (
                <ol className="flex flex-col gap-1">
                    {questions.map((question, index) => (
                        <li
                            key={question.key}
                            {...itemProps(index)}
                            className={cn(
                                'rounded-lg',
                                dragIndex === index && 'opacity-50',
                                overIndex === index && dragIndex !== index && 'ring-primary ring-2',
                            )}
                        >
                            <QuestionNavigationItem
                                question={question}
                                index={index}
                                total={questions.length}
                                active={selectedKey === question.key}
                                onSelect={() => onSelect(question.key)}
                                onDuplicate={() => onDuplicate(question.key)}
                                onMove={(to) => onMove(index, to)}
                                onDelete={() => onDelete(question.key)}
                            />
                        </li>
                    ))}
                </ol>
            )}
        </nav>
    );
};
