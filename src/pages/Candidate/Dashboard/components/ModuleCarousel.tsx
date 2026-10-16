import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ModuleThumbnailCard } from '@/components/patterns/ModuleThumbnailCard';
import { Card } from '@/components/ui/Card';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { strings } from '@/locales/id';
import type { LearningModule } from '@/types/module';
import { cn } from '@/utils/cn';
import { staggerDelayMs } from '@/utils/motion';

const ITEM_CLASS = 'w-[80%] shrink-0 snap-start sm:w-[46%] xl:w-[31%] 2xl:w-[23.5%]';
const TRACK_CLASS =
    'flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-1 px-1 pt-4 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
const EDGE_TOLERANCE_PX = 4;
const REVEAL_STEP_MS = 40;
const REVEAL_MAX_STAGGERED = 5;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface ModuleCarouselProps {
    label: string;
    materials: LearningModule[];
    toBuilder: (id: string) => string;
    ariaLabelBuilder?: (material: LearningModule) => string;
    showCategoryBadge?: boolean;
}

export const ModuleCarousel = ({ label, materials, toBuilder, ariaLabelBuilder, showCategoryBadge = true }: ModuleCarouselProps) => {
    const trackRef = useRef<HTMLUListElement>(null);
    const [edges, setEdges] = useState({ atStart: true, atEnd: true });

    const measure = useCallback(() => {
        const track = trackRef.current;

        if (track === null) {
            return;
        }

        const maxScroll = track.scrollWidth - track.clientWidth;

        setEdges({
            atStart: track.scrollLeft <= EDGE_TOLERANCE_PX,
            atEnd: track.scrollLeft >= maxScroll - EDGE_TOLERANCE_PX,
        });
    }, []);

    useEffect(() => {
        const track = trackRef.current;

        if (track === null) {
            return;
        }

        const observer = new ResizeObserver(measure);
        observer.observe(track);

        return () => {
            observer.disconnect();
        };
    }, [measure, materials.length]);

    const slide = (direction: -1 | 1) => {
        const track = trackRef.current;

        if (track === null) {
            return;
        }

        track.scrollBy({
            left: direction * track.clientWidth * 0.85,
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });
    };

    const controlClass = cn(
        'bg-surface text-primary-dark border-line absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border',
        'shadow-raised hover:bg-primary-light focus-visible:outline-primary transition-[opacity,background-color] focus-visible:outline-2 sm:flex',
    );

    return (
        <div role="region" aria-roledescription="carousel" aria-label={label} className="relative">
            <ul
                ref={trackRef}
                onScroll={measure}
                className={cn(
                    TRACK_CLASS,
                    edges.atEnd === false && edges.atStart && '[mask-image:linear-gradient(to_right,black_88%,transparent)]',
                    edges.atStart === false && edges.atEnd && '[mask-image:linear-gradient(to_left,black_88%,transparent)]',
                    edges.atStart === false &&
                    edges.atEnd === false &&
                    '[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
                )}
            >
                {materials.map((material, index) => (
                    <li
                        key={material.id}
                        className={cn(ITEM_CLASS, 'motion-rise')}
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

            <button
                type="button"
                aria-label={strings.dashboard.carouselPrevious}
                title={strings.dashboard.carouselPrevious}
                onClick={() => slide(-1)}
                aria-hidden={edges.atStart}
                tabIndex={edges.atStart ? -1 : 0}
                className={cn(controlClass, '-left-3', edges.atStart && 'pointer-events-none opacity-0')}
            >
                <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <button
                type="button"
                aria-label={strings.dashboard.carouselNext}
                title={strings.dashboard.carouselNext}
                onClick={() => slide(1)}
                aria-hidden={edges.atEnd}
                tabIndex={edges.atEnd ? -1 : 0}
                className={cn(controlClass, '-right-3', edges.atEnd && 'pointer-events-none opacity-0')}
            >
                <ChevronRight aria-hidden="true" className="size-5" />
            </button>
        </div>
    );
};

export const ModuleCarouselSkeleton = ({ count }: { count: number }) => (
    <LoadingBlock label={strings.common.loading} className={cn(TRACK_CLASS, 'overflow-hidden')}>
        {Array.from({ length: count }, (_, index) => (
            <Card key={index} className={cn(ITEM_CLASS, 'overflow-hidden')}>
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
