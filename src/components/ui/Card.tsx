import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** Angkat kartu sedikit saat hover. Hanya untuk kartu yang benar-benar bisa diklik. */
    interactive?: boolean;
}

export const Card = ({ interactive = false, className, ...rest }: CardProps) => (
    <div
        className={cn(
            'bg-surface border-line rounded-card border shadow-card',
            interactive && 'hover:shadow-raised transition-[transform,box-shadow] hover:-translate-y-0.5',
            className,
        )}
        {...rest}
    />
);
