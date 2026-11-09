import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { strings } from '@/locales/id';
import type { QuizListItem } from '@/pages/QuizMaterials/types';

interface QuizDeleteDialogProps {
    quiz: QuizListItem | null;
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const QuizDeleteDialog = ({ quiz, isDeleting, onConfirm, onCancel }: QuizDeleteDialogProps) => (
    <ConfirmDialog
        open={quiz !== null}
        title={strings.quizMaterials.deleteTitle}
        description={`${strings.quizMaterials.deleteBodyPrefix} "${quiz?.title ?? ''}" ${strings.quizMaterials.deleteBodySuffix}`}
        confirmLabel={strings.quizMaterials.deleteConfirm}
        cancelLabel={strings.quizMaterials.deleteCancel}
        isConfirming={isDeleting}
        confirmingLabel={strings.quizMaterials.deleting}
        onConfirm={onConfirm}
        onCancel={onCancel}
    />
);
