import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { strings } from '@/locales/id';
import type { LearningModule } from '@/types/module';
import { cn } from '@/utils/cn';
import { staggerDelayMs } from '@/utils/motion';

const REVEAL_STEP_MS = 50;
const REVEAL_MAX_STAGGERED = 5;
const GRID_CLASS = 'grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]';
const CARD_CLASS =
    'bg-surface rounded-card group block overflow-hidden shadow-[0_2px_6px_rgb(0_0_0/0.3)] transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-8px_rgb(0_0_0/0.45)] focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2';

const revealStyle = (index: number) => ({
    animationDelay: `${String(staggerDelayMs(index, { stepMs: REVEAL_STEP_MS, maxStaggered: REVEAL_MAX_STAGGERED }))}ms`,
});

const Banner = ({ src, className }: { src: string | null; className?: string }) => {
    const [failed, setFailed] = useState(false);

    return (
        <div className={cn('bg-neutral-soft relative overflow-hidden', className)}>
            {src === null || failed ? (
                <div className="text-neutral-line flex size-full items-center justify-center">
                    <ImageOff aria-hidden="true" className="size-6" />
                    <span className="sr-only">{strings.library.noBanner}</span>
                </div>
            ) : (
                <img
                    src={src}
                    alt=""
                    loading="lazy"
                    onError={() => setFailed(true)}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
            )}
        </div>
    );
};

interface ModuleFeatureGridProps {
    materials: LearningModule[];
    toBuilder: (id: string) => string;
    ariaLabelBuilder?: (material: LearningModule) => string;
}

export const ModuleFeatureGrid = ({ materials, toBuilder, ariaLabelBuilder }: ModuleFeatureGridProps) => {
    const [featured, ...rest] = materials;

    if (featured === undefined) {
        return null;
    }

    return (
        <div className={GRID_CLASS}>
            <Link
                to={toBuilder(featured.id)}
                aria-label={ariaLabelBuilder?.(featured) ?? featured.title}
                className={cn(CARD_CLASS, 'motion-rise flex flex-col')}
                style={revealStyle(0)}
            >
                <Banner src={featured.banner} className="aspect-video w-full" />
                <div className="flex flex-1 flex-col gap-1.5 p-4 lg:p-5 bg-gradiend">
                    <h3 className="text-section text-[#8ebde8] line-clamp-2 transition-colors">
                        {featured.title}
                    </h3>
                    {featured.descriptionClean === null ? null : (
                        <p className="text-body text-white line-clamp-3">{featured.descriptionClean}</p>
                    )}
                </div>
            </Link>

            {rest.length === 0 ? null : (
                <ul className="flex flex-col gap-3">
                    {rest.map((material, index) => (
                        <li key={material.id} className="motion-rise flex lg:flex-1" style={revealStyle(index + 1)}>
                            <Link
                                to={toBuilder(material.id)}
                                aria-label={ariaLabelBuilder?.(material) ?? material.title}
                                className={cn(CARD_CLASS, 'flex w-full items-center gap-3 bg-gradiend')}
                            >
                                <Banner
                                    src={material.banner}
                                    className="aspect-square w-20 shrink-0 self-stretch sm:w-24 lg:aspect-auto lg:w-40"
                                />
                                <span className="flex min-w-0 flex-col gap-1 pe-3">
                                    <span className="font-display text-card text-[#8ebde8] line-clamp-2 transition-colors">
                                        {material.title}
                                    </span>
                                    {material.descriptionClean === null ? null : (
                                        <span className="text-caption text-white line-clamp-2">{material.descriptionClean}</span>
                                    )}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export const ModuleFeatureGridSkeleton = ({ count }: { count: number }) => (
    <LoadingBlock label={strings.common.loading} className={GRID_CLASS}>
        <div className="bg-surface rounded-card overflow-hidden">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="flex flex-col gap-2 p-5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
            </div>
        </div>
        <div className="flex flex-col gap-3">
            {Array.from({ length: Math.max(count - 1, 0) }, (_, index) => (
                <div key={index} className="bg-surface rounded-card flex items-center gap-3 overflow-hidden lg:flex-1">
                    <Skeleton className="aspect-square w-20 shrink-0 self-stretch rounded-none sm:w-24 lg:aspect-auto lg:w-40" />
                    <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                    </div>
                </div>
            ))}
        </div>
    </LoadingBlock>
);
