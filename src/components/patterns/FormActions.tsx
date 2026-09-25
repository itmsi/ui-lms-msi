import { Save } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/Button';

interface FormActionsProps {
    submitLabel: string;
    submittingLabel: string;
    cancelLabel: string;
    onCancel: () => void;
    isSubmitting?: boolean;
    children?: ReactNode;
}

const FormActions = ({
    submitLabel,
    submittingLabel,
    cancelLabel,
    onCancel,
    isSubmitting = false,
    children,
}: FormActionsProps) => (
    <div className="border-line bg-surface sticky bottom-0 flex flex-wrap justify-end gap-2 border-t p-4 rounded-2xl shadow-sm">
        <Button type="button" variant="secondary" className='min-w-30' onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
        </Button>

        <Button
            type="submit"
            loading={isSubmitting}
            loadingLabel={submittingLabel}
            className='min-w-30'
            leadingIcon={<Save aria-hidden="true" className="size-4" />}
        >
            {submitLabel}
        </Button>

        {children}
    </div>
);

export default FormActions;
