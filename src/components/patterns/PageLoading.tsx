import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { strings } from '@/locales/id';

export const PageLoading = () => (
    <LoadingBlock label={strings.common.loading} className="mx-auto w-full max-w-[1200px] px-4 py-8 lg:px-8">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-6 h-40 w-full" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    </LoadingBlock>
);
