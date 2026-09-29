import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface PopoverProps {
    label: string;
    trigger: ReactNode;
    children: (close: () => void) => ReactNode;
    align?: 'start' | 'end';
    triggerClassName?: string;
    panelClassName?: string;
}

export const Popover = ({
    label,
    trigger,
    children,
    align = 'end',
    triggerClassName,
    panelClassName,
}: PopoverProps) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const close = useCallback(() => {
        setOpen(false);
    }, []);

    useEffect(() => {
        if (open === false) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (containerRef.current?.contains(event.target as Node) === false) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                aria-label={label}
                aria-expanded={open}
                aria-haspopup="true"
                onClick={() => setOpen((previous) => previous === false)}
                className={cn(
                    'text-muted hover:bg-neutral-soft hover:text-ink inline-flex items-center justify-center rounded-lg transition-colors',
                    triggerClassName,
                )}
            >
                {trigger}
            </button>
            {open ? (
                <div
                    className={cn(
                        'bg-surface border-line rounded-card shadow-raised motion-rise absolute top-[calc(100%+8px)] z-20 border',
                        align === 'end' ? 'right-0' : 'left-0',
                        panelClassName,
                    )}
                >
                    {children(close)}
                </div>
            ) : null}
        </div>
    );
};
