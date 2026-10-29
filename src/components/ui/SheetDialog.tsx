import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface SheetDialogProps {
    open: boolean;
    onClose: () => void;
    labelledBy: string;
    children: ReactNode;
    className?: string;
}

export const SheetDialog = ({ open, onClose, labelledBy, children, className }: SheetDialogProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (dialog === null) {
            return;
        }

        if (open && dialog.open === false) {
            dialog.showModal();
        } else if (open === false && dialog.open) {
            dialog.close();
        }
    }, [open]);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (open === false || dialog === null) {
            return;
        }

        const handleBackdropClick = (event: MouseEvent) => {
            if (event.target === dialog) {
                dialog.close();
            }
        };

        dialog.addEventListener('click', handleBackdropClick);

        return () => {
            dialog.removeEventListener('click', handleBackdropClick);
        };
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={labelledBy}
            onClose={onClose}
            className={cn(
                'bg-surface shadow-raised motion-rise max-h-[92dvh] overflow-y-auto border-0 p-0 backdrop:bg-black/40',
                'mx-0 mt-auto mb-0 rounded-t-2xl',
                'sm:m-auto sm:rounded-2xl',
                className,
            )}
        >
            {open ? (
                <div className="flex flex-col gap-4 p-5">
                    <span aria-hidden="true" className="bg-line mx-auto h-1 w-10 rounded-full sm:hidden" />
                    {children}
                </div>
            ) : null}
        </dialog>
    );
};
