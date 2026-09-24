import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import type { ButtonVariant } from '@/components/ui/buttonStyles';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    /** Tombol konfirmasi memakai 'danger' untuk tindakan yang tidak bisa dibatalkan. */
    confirmVariant?: ButtonVariant;
    /** Menonaktifkan kedua tombol dan menukar label konfirmasi — mencegah kirim ganda. */
    isConfirming?: boolean;
    confirmingLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Dibangun di atas elemen native `<dialog>`: fokus otomatis terkunci di dalamnya dan
 * tombol Escape sudah bekerja tanpa kode tambahan.
 */
export const ConfirmDialog = ({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    confirmVariant = 'danger',
    isConfirming = false,
    confirmingLabel,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (dialog === null) {
            return;
        }

        if (open) {
            if (dialog.open === false) {
                dialog.showModal();
            }
        } else if (dialog.open) {
            dialog.close();
        }
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            onCancel={(event) => {
                // Escape memicu event 'cancel' bawaan — dialihkan ke handler yang sama dengan tombol Batal.
                event.preventDefault();

                if (isConfirming === false) {
                    onCancel();
                }
            }}
            onClose={onCancel}
            className="border-line shadow-raised motion-rise m-auto w-full max-w-sm rounded-2xl border p-0 backdrop:bg-black/40"
        >
            <div className="flex flex-col gap-4 p-5">
                <div className="flex flex-col gap-1.5">
                    <h2 className="text-card text-ink font-display">{title}</h2>
                    <p className="text-body text-muted">{description}</p>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={onCancel} disabled={isConfirming}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={confirmVariant}
                        size="sm"
                        onClick={onConfirm}
                        loading={isConfirming}
                        loadingLabel={confirmingLabel}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </dialog>
    );
};
