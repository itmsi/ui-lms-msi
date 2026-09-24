import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE_CLASS =
    'inline-flex cursor-pointer rounded-full font-display items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
    primary: 'text-body text-white bg-primary hover:bg-primary-dark',
    secondary: 'bg-surface text-body text-ink border border-line hover:bg-neutral-soft',
    ghost: 'text-primary text-body hover:bg-primary-light',
    danger: 'bg-danger text-body text-white hover:bg-danger-ink',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
    sm: 'h-9 px-3',
    md: 'h-11 px-4',
    lg: 'h-12 px-5',
};

interface ButtonClassOptions {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    className?: string;
}

/** Dipakai bersama oleh Button dan LinkButton supaya keduanya tidak pernah berbeda tampilan. */
export const getButtonClassName = ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className,
}: ButtonClassOptions = {}) => cn(BASE_CLASS, VARIANT_CLASS[variant], SIZE_CLASS[size], fullWidth && 'w-full', className);
