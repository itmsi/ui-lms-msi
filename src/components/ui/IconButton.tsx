import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    label: string;
    icon: ReactNode;
    tone?: 'neutral' | 'danger';
}

export const IconButton = ({ label, icon, tone = 'neutral', className, type = 'button', ...rest }: IconButtonProps) => (
    <button
        type={type}
        aria-label={label}
        title={label}
        className={cn(
            'inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-40',
            tone === 'danger'
                ? 'text-muted hover:bg-danger-soft hover:text-danger-ink'
                : 'text-muted hover:bg-neutral-soft hover:text-ink',
            className,
        )}
        {...rest}
    >
        {icon}
    </button>
);
