import { Card } from '@/components/ui/Card';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { strings } from '@/locales/id';
import { MaterialCard } from '@/pages/Candidate/Library/components/MaterialCard';
import type { LibraryModule } from '@/pages/Candidate/Library/types';

const GRID_CLASS = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';

interface MaterialGridProps {
    materials: LibraryModule[];
}

export const MaterialGrid = ({ materials }: MaterialGridProps) => (
    <ul className={GRID_CLASS}>
        {materials.map((material) => (
            <li key={material.id}>
                <MaterialCard material={material} />
            </li>
        ))}
    </ul>
);

interface MaterialGridSkeletonProps {
    count: number;
}

export const MaterialGridSkeleton = ({ count }: MaterialGridSkeletonProps) => (
    <LoadingBlock label={strings.common.loading} className={GRID_CLASS}>
        {Array.from({ length: count }, (_, index) => (
            <Card key={index} className="overflow-hidden">
                <Skeleton className="aspect-video w-full rounded-none" />
                <div className="flex flex-col gap-2 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
            </Card>
        ))}
    </LoadingBlock>
);
