import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

export const WoodPanel = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "rounded-card bg-[url('/wood.png')] bg-repeat p-4 shadow-[0_10px_25px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.5)] lg:p-6",
            className,
        )}
        {...rest}
    />
);
