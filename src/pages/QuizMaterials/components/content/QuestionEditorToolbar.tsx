import { Copy, Trash2 } from 'lucide-react';

import { ActionMenu } from '@/components/ui/ActionMenu';
import { InlineSelect } from '@/components/ui/InlineSelect';
import { strings } from '@/locales/id';
import { QUESTION_TYPES } from '@/pages/QuizMaterials/types';
import type { QuestionType } from '@/pages/QuizMaterials/types';

const TYPE_OPTIONS = QUESTION_TYPES.map((type) => ({ value: type, label: strings.quizContent.type[type] }));

interface QuestionEditorToolbarProps {
    type: QuestionType;
    readOnly: boolean;
    deleteLocked: boolean;
    onChangeType: (type: QuestionType) => void;
    onDuplicate: () => void;
    onDelete: () => void;
}

export const QuestionEditorToolbar = ({
    type,
    readOnly,
    deleteLocked,
    onChangeType,
    onDuplicate,
    onDelete,
}: QuestionEditorToolbarProps) => (
    <div className="border-line flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-3 sm:px-5">
        <InlineSelect
            label={strings.quizContent.typeLabel}
            hideLabel
            options={TYPE_OPTIONS}
            value={type}
            onChange={onChangeType}
            className="min-w-44"
            selectClassName="font-medium"
        />

        {readOnly ? null : (
            <div className="ml-auto">
                <ActionMenu
                    label={strings.quizContent.questionMenu}
                    items={[
                        { label: strings.quizContent.duplicate, icon: Copy, onSelect: onDuplicate },
                        {
                            label: strings.quizContent.delete,
                            icon: Trash2,
                            onSelect: onDelete,
                            tone: 'danger',
                            disabled: deleteLocked,
                        },
                    ]}
                />
            </div>
        )}
    </div>
);
