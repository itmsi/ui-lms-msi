import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ChevronProps } from 'react-day-picker';

import { cn } from '@/utils/cn';

export const CalendarChevron = ({ orientation, className }: ChevronProps) => {
    if (orientation === 'left') {
        return <ChevronLeft aria-hidden="true" className={cn(className, 'size-5')} />;
    }

    if (orientation === 'down') {
        return <ChevronDown aria-hidden="true" className={cn('text-muted', className)} />;
    }

    return <ChevronRight aria-hidden="true" className={cn(className, 'size-5')} />;
};
