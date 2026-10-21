import { cn } from '@/utils/cn';

interface SkeletonProps {
    className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
    <div aria-hidden="true" className={cn('bg-neutral-soft animate-pulse rounded-md', className)} />
);

interface LoadingBlockProps {
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
