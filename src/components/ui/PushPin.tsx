import { useId } from 'react';

import { cn } from '@/utils/cn';

const PRIMARY = { stopColor: 'var(--color-primary)' };
const PRIMARY_DARK = { stopColor: 'var(--color-primary-dark)' };

interface PushPinProps {
    className?: string;
}

export const PushPin = ({ className }: PushPinProps) => {
    const id = useId();
    const bodyId = `${id}-body`;
    const headId = `${id}-head`;

    return (
        <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 16 20"
            className={cn('pointer-events-none h-5 w-4 drop-shadow-[1px_2px_1px_rgb(0_0_0/0.45)]', className)}
        >
            <defs>
                <linearGradient id={bodyId} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" style={PRIMARY_DARK} />
                    <stop offset="0.45" style={PRIMARY} />
                    <stop offset="1" style={PRIMARY_DARK} />
                </linearGradient>
                <radialGradient id={headId} cx="0.35" cy="0.3" r="0.8">
                    <stop offset="0" style={PRIMARY} />
                    <stop offset="1" style={PRIMARY_DARK} />
                </radialGradient>
            </defs>

            <line x1="8" y1="13" x2="8" y2="19.5" strokeWidth="1.2" strokeLinecap="round" style={{ stroke: 'var(--color-neutral-line)' }} />
            <ellipse cx="8" cy="12.6" rx="4.6" ry="1.7" fill={`url(#${bodyId})`} />
            <path d="M5.4 5 L6.4 12.4 L9.6 12.4 L10.6 5 Z" fill={`url(#${bodyId})`} />
            <ellipse cx="8" cy="4.6" rx="6" ry="3.6" fill={`url(#${headId})`} />
            <ellipse cx="6" cy="3.4" rx="2" ry="0.9" fill="white" opacity="0.65" />
        </svg>
    );
};
