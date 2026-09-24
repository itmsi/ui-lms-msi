import { cn } from '@/utils/cn';

interface SkeletonProps {
    className?: string;
}

/** Skeleton, bukan spinner besar: bentuk halaman tetap terbaca selama memuat. */
export const Skeleton = ({ className }: SkeletonProps) => (
    <div aria-hidden="true" className={cn('bg-neutral-soft animate-pulse rounded-md', className)} />
);

interface SkeletonTextProps {
    lines?: number;
    className?: string;
}

export const SkeletonText = ({ lines = 3, className }: SkeletonTextProps) => (
    <div className={cn('flex flex-col gap-2', className)}>
        {Array.from({ length: lines }, (_, index) => (
            <Skeleton key={index} className={cn('h-3.5', index === lines - 1 ? 'w-2/3' : 'w-full')} />
        ))}
    </div>
);

interface LoadingBlockProps {
    /** Dibacakan screen reader supaya status memuat tidak hanya terlihat secara visual. */
    label: string;
    className?: string;
    children: React.ReactNode;
}

export const LoadingBlock = ({ label, className, children }: LoadingBlockProps) => (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
        <span className="sr-only">{label}</span>
        {children}
    </div>
);
