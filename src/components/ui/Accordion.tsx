import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface AccordionProps {
    title: ReactNode;
    eyebrow?: ReactNode;
    headingAs?: 'h2' | 'h3' | 'h4';
    defaultOpen?: boolean;
    className?: string;
    children: ReactNode;
}

export const Accordion = ({
    title,
    eyebrow,
    headingAs: Heading = 'h3',
    defaultOpen = false,
    className,
    children,
}: AccordionProps) => (
    <details
        open={defaultOpen}
        className={cn(
            'group/accordion border-primary/30 rounded-card bg-surface overflow-hidden border open:border-primary',
            className,
        )}
    >
        <summary
            className={cn(
                'flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-3 transition-colors motion-reduce:transition-none',
                '[&::-webkit-details-marker]:hidden',
                'bg-primary-light hover:bg-primary/20',
                'group-open/accordion:bg-primary group-open/accordion:hover:bg-primary-dark',
                'focus-visible:outline-primary focus-visible:outline-2 focus-visible:-outline-offset-4',
            )}
        >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                {eyebrow === undefined ? null : (
                    <span className="text-caption text-primary group-open/accordion:text-primary-light font-medium">
                        {eyebrow}
                    </span>
                )}
                <Heading className="text-card text-primary-dark group-open/accordion:text-white">{title}</Heading>
            </div>

            <span
                aria-hidden="true"
                className="bg-primary group-open/accordion:text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-white transition-colors group-open/accordion:bg-white motion-reduce:transition-none"
            >
                <ChevronDown className="size-5 transition-transform group-open/accordion:rotate-180 motion-reduce:transition-none" />
            </span>
        </summary>

        <div className="px-4 pb-4">{children}</div>
    </details>
);
