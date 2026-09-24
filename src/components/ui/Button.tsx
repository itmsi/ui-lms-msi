import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { getButtonClassName } from '@/components/ui/buttonStyles';
import type { ButtonSize, ButtonVariant } from '@/components/ui/buttonStyles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Menonaktifkan tombol seketika supaya aksi tidak terkirim dua kali. */
    loading?: boolean;
    loadingLabel?: string;
    fullWidth?: boolean;
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
}

export const Button = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingLabel,
    fullWidth = false,
    leadingIcon,
    trailingIcon,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
}: ButtonProps) => (
    <button
        type={type}
        disabled={disabled === true || loading}
        aria-busy={loading || undefined}
        className={getButtonClassName({ variant, size, fullWidth, className })}
        {...rest}
    >
        {loading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : leadingIcon}
        <span>{loading && loadingLabel !== undefined ? loadingLabel : children}</span>
        {loading ? null : trailingIcon}
    </button>
);
