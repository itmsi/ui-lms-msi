import { Copy, Trash2 } from 'lucide-react';

import { ActionMenu } from '@/components/ui/ActionMenu';
import { InlineSelect } from '@/components/ui/InlineSelect';
import { Switch } from '@/components/ui/Switch';
import { strings } from '@/locales/id';
import { QUESTION_TYPES } from '@/pages/QuizMaterials/types';
import type { QuestionType } from '@/pages/QuizMaterials/types';

const TYPE_OPTIONS = QUESTION_TYPES.map((type) => ({ value: type, label: strings.quizContent.type[type] }));

interface QuestionEditorToolbarProps {
    type: QuestionType;
    required: boolean;
    onChangeType: (type: QuestionType) => void;
    onChangeRequired: (required: boolean) => void;
    onDuplicate: () => void;
    onDelete: () => void;
}

export const QuestionEditorToolbar = ({
    type,
    required,
    onChangeType,
    onChangeRequired,
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

        <Switch label={strings.quizContent.requiredLabel} checked={required} onChange={onChangeRequired} />

        <div className="ml-auto">
            <ActionMenu
                label={strings.quizContent.questionMenu}
                items={[
                    { label: strings.quizContent.duplicate, icon: Copy, onSelect: onDuplicate },
                    { label: strings.quizContent.delete, icon: Trash2, onSelect: onDelete, tone: 'danger' },
                ]}
            />
        </div>
    </div>
);
