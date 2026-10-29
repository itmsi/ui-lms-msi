import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useId } from 'react';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { useDragReorder } from '@/hooks/useDragReorder';
import { strings } from '@/locales/id';
import { MIN_CHOICE_OPTIONS } from '@/pages/QuizMaterials/questionModel';
import type { AnswerOption, QuizQuestion, TrueFalseAnswer } from '@/pages/QuizMaterials/types';
import { cn } from '@/utils/cn';

const ROW_CLASS = 'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-colors';

const rowTone = (correct: boolean) => (correct ? 'border-primary/50 bg-primary-light' : 'border-line bg-background');

const CORRECT_INPUT_CLASS = 'accent-primary focus-visible:outline-primary size-4.5 shrink-0 cursor-pointer focus-visible:outline-2';

interface AnswerOptionItemProps {
    option: AnswerOption;
    index: number;
    multiple: boolean;
    groupName: string;
    canRemove: boolean;
    dragProps: ReturnType<ReturnType<typeof useDragReorder>['itemProps']>;
    handleProps: ReturnType<ReturnType<typeof useDragReorder>['handleProps']>;
    isDragOver: boolean;
    onToggleCorrect: () => void;
    onChangeText: (text: string) => void;
    onRemove: () => void;
}

const AnswerOptionItem = ({
    option,
    index,
    multiple,
    groupName,
    canRemove,
    dragProps,
    handleProps,
    isDragOver,
    onToggleCorrect,
    onChangeText,
    onRemove,
}: AnswerOptionItemProps) => {
    const label = `${strings.quizContent.optionLabel} ${String(index + 1)}`;

    return (
        <li {...dragProps} className={cn(ROW_CLASS, rowTone(option.isCorrect), isDragOver && 'ring-primary ring-2')}>
            <input
                type={multiple ? 'checkbox' : 'radio'}
                name={groupName}
                checked={option.isCorrect}
                onChange={onToggleCorrect}
                aria-label={`${strings.quizContent.markCorrect}: ${label}`}
                className={CORRECT_INPUT_CLASS}
            />

            <Input
                label={label}
                hideLabel
                value={option.text}
                placeholder={strings.quizContent.optionPlaceholder}
                onChange={(event) => onChangeText(event.target.value)}
                className="min-w-0 flex-1"
                inputClassName="h-9 bg-surface"
            />

            <button
                type="button"
                {...handleProps}
                aria-label={`${strings.quizContent.reorderOption}: ${label}`}
                title={strings.quizContent.reorderOption}
                className="text-muted hover:text-ink hover:bg-neutral-soft focus-visible:outline-primary flex size-8 shrink-0 cursor-grab items-center justify-center rounded-lg focus-visible:outline-2 active:cursor-grabbing"
            >
                <GripVertical aria-hidden="true" className="size-4" />
            </button>

            <IconButton
                label={`${strings.quizContent.removeOption}: ${label}`}
                icon={<Trash2 aria-hidden="true" className="size-4" />}
                tone="danger"
                disabled={canRemove === false}
                onClick={onRemove}
                className="size-8"
            />
        </li>
    );
};

const TRUE_FALSE_VALUES: readonly TrueFalseAnswer[] = ['true', 'false'];

interface AnswerOptionsEditorProps {
    question: QuizQuestion;
    onToggleCorrect: (optionKey: string) => void;
    onChangeOptionText: (optionKey: string, text: string) => void;
    onRemoveOption: (optionKey: string) => void;
    onMoveOption: (from: number, to: number) => void;
    onAddOption: () => void;
    onChangeTrueFalse: (answer: TrueFalseAnswer) => void;
    onChangeExpected: (text: string) => void;
}

export const AnswerOptionsEditor = ({
    question,
    onToggleCorrect,
    onChangeOptionText,
    onRemoveOption,
    onMoveOption,
    onAddOption,
    onChangeTrueFalse,
    onChangeExpected,
}: AnswerOptionsEditorProps) => {
    const groupName = useId();
    const { itemProps, handleProps, overIndex, dragIndex } = useDragReorder(question.options.length, onMoveOption, true);

    if (question.type === 'short_answer') {
        return (
            <RichTextEditor
                label={strings.quizContent.expectedLabel}
                value={question.expectedAnswer}
                hint={strings.quizContent.expectedHint}
                onChange={onChangeExpected}
                allowTables
            />
        );
    }

    if (question.type === 'true_false') {
        return (
            <fieldset className="flex flex-col gap-2">
                <legend className="text-body text-ink mb-1 font-medium">{strings.quizContent.answersLabel}</legend>
                <p className="text-caption text-muted">{strings.quizContent.answersHintTrueFalse}</p>
                <ul className="flex flex-col gap-2">
                    {TRUE_FALSE_VALUES.map((value) => {
                        const checked = question.trueFalseAnswer === value;

                        return (
                            <li key={value}>
                                <label className={cn(ROW_CLASS, rowTone(checked), 'text-body text-ink min-h-12 cursor-pointer')}>
                                    <input
                                        type="radio"
                                        name={groupName}
                                        checked={checked}
                                        onChange={() => onChangeTrueFalse(value)}
                                        className={CORRECT_INPUT_CLASS}
                                    />
                                    {value === 'true' ? strings.quizContent.trueLabel : strings.quizContent.falseLabel}
                                </label>
                            </li>
                        );
                    })}
                </ul>
            </fieldset>
        );
    }

    const multiple = question.type === 'multiple_answers';
    const canRemove = question.options.length > MIN_CHOICE_OPTIONS;

    return (
        <fieldset className="flex flex-col gap-2">
            <legend className="text-body text-ink mb-1 font-medium">{strings.quizContent.answersLabel}</legend>
            <p className="text-caption text-muted">
                {multiple ? strings.quizContent.answersHintMultiple : strings.quizContent.answersHintSingle}
            </p>

            <ol className="flex flex-col gap-2">
                {question.options.map((option, index) => (
                    <AnswerOptionItem
                        key={option.key}
                        option={option}
                        index={index}
                        multiple={multiple}
                        groupName={groupName}
                        canRemove={canRemove}
                        dragProps={itemProps(index)}
                        handleProps={handleProps(index)}
                        isDragOver={overIndex === index && dragIndex !== index}
                        onToggleCorrect={() => onToggleCorrect(option.key)}
                        onChangeText={(text) => onChangeOptionText(option.key, text)}
                        onRemove={() => onRemoveOption(option.key)}
                    />
                ))}
            </ol>

            <div>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onAddOption}
                    leadingIcon={<Plus aria-hidden="true" className="text-primary size-4" />}
                >
                    {strings.quizContent.addOption}
                </Button>
            </div>
        </fieldset>
    );
};
