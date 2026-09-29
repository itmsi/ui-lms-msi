import { ModuleRow } from '@/components/patterns/ModuleRow';
import { Card } from '@/components/ui/Card';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { strings } from '@/locales/id';
import type { LearningModule } from '@/types/module';
import { staggerDelayMs } from '@/utils/motion';

const LIST_CLASS = 'flex flex-col gap-3';

const REVEAL_STEP_MS = 30;
const REVEAL_MAX_STAGGERED = 9;

interface ModuleRowListProps {
    materials: LearningModule[];
    toBuilder: (id: string) => string;
    showCategoryBadge?: boolean;
}

export const ModuleRowList = ({ materials, toBuilder, showCategoryBadge = true }: ModuleRowListProps) => (
    <ul className={LIST_CLASS}>
        {materials.map((material, index) => (
            <li
                key={material.id}
                className="motion-rise"
                style={{
                    animationDelay: `${String(staggerDelayMs(index, { stepMs: REVEAL_STEP_MS, maxStaggered: REVEAL_MAX_STAGGERED }))}ms`,
                }}
            >
                <ModuleRow material={material} to={toBuilder(material.id)} showCategoryBadge={showCategoryBadge} />
            </li>
        ))}
    </ul>
);

interface ModuleRowListSkeletonProps {
    count: number;
}

export const ModuleRowListSkeleton = ({ count }: ModuleRowListSkeletonProps) => (
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
