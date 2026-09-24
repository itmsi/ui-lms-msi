import { Card } from '@/components/ui/Card';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { strings } from '@/locales/id';
import { MaterialCard } from '@/pages/Candidate/Library/components/MaterialCard';
import type { LibraryModule } from '@/pages/Candidate/Library/types';

/**
 * Definisi kolom tinggal di satu tempat dan dipakai grid isi maupun skeleton, supaya
 * tata letak tidak bergeser saat data selesai dimuat.
 *
 * Breakpoint memperhitungkan sidebar 280px: di 1280px lebar konten ~1000px (3 kolom),
 * di 1536px ~1250px (4 kolom). Kartu tetap di kisaran 300–330px — cukup padat, dan
 * tidak melebar berlebihan saat materinya sedikit.
 */
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
