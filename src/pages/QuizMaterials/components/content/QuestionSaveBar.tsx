import { CircleCheck, CircleDashed, CircleDot, Save } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { strings } from '@/locales/id';
import type { QuestionSaveStatus } from '@/pages/QuizMaterials/types';
import { cn } from '@/utils/cn';

const STATUS_STYLE: Record<QuestionSaveStatus, { icon: LucideIcon; className: string }> = {
    new: { icon: CircleDashed, className: 'text-muted' },
    dirty: { icon: CircleDot, className: 'text-warning-ink' },
    saved: { icon: CircleCheck, className: 'text-success-ink' },
};

interface QuestionSaveBarProps {
    status: QuestionSaveStatus;
    isSaving: boolean;
    canSave: boolean;
    onSave: () => void;
}

export const QuestionSaveBar = ({ status, isSaving, canSave, onSave }: QuestionSaveBarProps) => {
    const { icon: Icon, className } = STATUS_STYLE[status];

    return (
        <div className="border-line bg-background rounded-b-card flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span className={cn('text-caption inline-flex items-center gap-1.5 font-medium', className)}>
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {strings.quizContent.saveStatus[status]}
            </span>

            <Button
                size="sm"
                onClick={onSave}
                disabled={canSave === false || status === 'saved'}
                loading={isSaving}
                loadingLabel={strings.quizContent.saving}
                leadingIcon={<Save aria-hidden="true" className="size-4" />}
                className="self-end sm:self-auto"
            >
                {status === 'new' ? strings.quizContent.saveQuestion : strings.quizContent.saveChanges}
            </Button>
        </div>
    );
};
