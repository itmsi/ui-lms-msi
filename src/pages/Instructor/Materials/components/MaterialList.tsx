import { Card } from '@/components/ui/Card';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { strings } from '@/locales/id';
import { MaterialRow } from '@/pages/Instructor/Materials/components/MaterialRow';
import type { LearningModule } from '@/types/module';

const LIST_CLASS = 'flex flex-col gap-3';

interface MaterialListProps {
    materials: LearningModule[];
}

export const MaterialList = ({ materials }: MaterialListProps) => (
    <ul className={LIST_CLASS}>
        {materials.map((material) => (
            <li key={material.id}>
                <MaterialRow material={material} />
            </li>
        ))}
    </ul>
);

interface MaterialListSkeletonProps {
    count: number;
}

export const MaterialListSkeleton = ({ count }: MaterialListSkeletonProps) => (
    <LoadingBlock label={strings.common.loading} className={LIST_CLASS}>
        {Array.from({ length: count }, (_, index) => (
            <Card key={index} className="flex items-start gap-4 p-3">
                <Skeleton className="aspect-video w-32 shrink-0" />
                <div className="flex flex-1 flex-col gap-2 py-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
            </Card>
        ))}
    </LoadingBlock>
);
