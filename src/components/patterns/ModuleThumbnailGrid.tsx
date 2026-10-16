import { ModuleThumbnailCard } from '@/components/patterns/ModuleThumbnailCard';
import { Card } from '@/components/ui/Card';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { strings } from '@/locales/id';
import type { LearningModule } from '@/types/module';
import { staggerDelayMs } from '@/utils/motion';

const GRID_CLASS = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';

const REVEAL_STEP_MS = 30;
const REVEAL_MAX_STAGGERED = 9;

interface ModuleThumbnailGridProps {
    materials: LearningModule[];
    toBuilder: (id: string) => string;
    ariaLabelBuilder?: (material: LearningModule) => string;
    showCategoryBadge?: boolean;
}

export const ModuleThumbnailGrid = ({
    materials,
    toBuilder,
    ariaLabelBuilder,
    showCategoryBadge = true,
}: ModuleThumbnailGridProps) => (
    <ul className={GRID_CLASS}>
        {materials.map((material, index) => (
            <li
                key={material.id}
                className="motion-rise"
                style={{
                    animationDelay: `${String(staggerDelayMs(index, { stepMs: REVEAL_STEP_MS, maxStaggered: REVEAL_MAX_STAGGERED }))}ms`,
                }}
            >
                <ModuleThumbnailCard
                    material={material}
                    to={toBuilder(material.id)}
                    ariaLabel={ariaLabelBuilder?.(material)}
                    showCategoryBadge={showCategoryBadge}
                />
            </li>
        ))}
    </ul>
);

interface ModuleThumbnailGridSkeletonProps {
    count: number;
}

export const ModuleThumbnailGridSkeleton = ({ count }: ModuleThumbnailGridSkeletonProps) => (
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
