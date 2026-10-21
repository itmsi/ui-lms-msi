import { BookOpen, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { strings } from '@/locales/id';
import type { LearningModule } from '@/types/module';
import { cn } from '@/utils/cn';
import { staggerDelayMs } from '@/utils/motion';

export const BENTO_SLOTS = 4;

const REVEAL_STEP_MS = 60;
const GRID_CLASS = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(13rem,auto)]';

const SPAN_BY_COUNT: Record<number, string[]> = {
    1: ['sm:col-span-2 lg:col-span-4'],
    2: ['sm:col-span-2 lg:col-span-2 lg:row-span-2', 'sm:col-span-2 lg:col-span-2 lg:row-span-2'],
    3: ['sm:col-span-2 lg:col-span-2 lg:row-span-2', 'lg:col-span-2', 'lg:col-span-2'],
    4: ['sm:col-span-2 lg:col-span-2 lg:row-span-2', '', '', 'sm:col-span-2 lg:col-span-2'],
};

const spanClass = (index: number, count: number): string => SPAN_BY_COUNT[count]?.[index] ?? '';

interface BentoCardProps {
    material: LearningModule;
    to: string;
    ariaLabel: string;
    featured: boolean;
    className: string;
    revealIndex: number;
}

const BentoCard = ({ material, to, ariaLabel, featured, className, revealIndex }: BentoCardProps) => {
    const [bannerFailed, setBannerFailed] = useState(false);
    const showBanner = material.banner !== null && bannerFailed === false;

    return (
        <Link
            to={to}
            aria-label={ariaLabel}
            className={cn(
                'bg-gradiend rounded-card group motion-rise relative isolate flex min-h-52 flex-col justify-end overflow-hidden text-white',
                'shadow-[0_2px_6px_rgb(0_0_0/0.3)] transition-[translate,box-shadow] duration-200',
                'hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-10px_rgb(0_0_0/0.55)]',
                'focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2',
                featured ? 'p-5 lg:p-7' : 'p-5',
                className,
            )}
            style={{ animationDelay: `${String(staggerDelayMs(revealIndex, { stepMs: REVEAL_STEP_MS, maxStaggered: BENTO_SLOTS }))}ms` }}
        >
            {showBanner ? (
                <>
                    <img
                        src={material.banner ?? ''}
                        alt=""
                        loading="lazy"
                        onError={() => setBannerFailed(true)}
                        className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                        aria-hidden="true"
                        className="from-primary-dark/95 via-primary-dark/85 to-primary-dark/25 absolute inset-0 -z-10 bg-linear-to-t"
                    />
                </>
            ) : null}

            <div className="flex flex-col gap-2.5">
                <span
                    aria-hidden="true"
                    className={cn(
                        'flex items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm',
                        featured ? 'size-12' : 'size-10',
                    )}
                >
                    <BookOpen className={featured ? 'size-6' : 'size-5'} />
                </span>

                <h3
                    className={'text-section text-[#8ebde8] line-clamp-2'}
                >
                    {material.title}
                </h3>

                {material.descriptionClean === null ? null : (
                    <p className={cn('text-body text-white/85 leading-5', featured ? 'line-clamp-3 max-w-prose' : 'line-clamp-3')}>
                        {material.descriptionClean}
                    </p>
                )}

                <span
                    className={cn(
                        'text-caption mt-1 inline-flex w-fit items-center gap-1 font-semibold transition-colors',
                        featured
                            ? 'rounded-full border border-white/50 px-3.5 py-1.5 group-hover:bg-white group-hover:text-primary-dark'
                            : 'text-white/90 group-hover:text-white',
                    )}
                >
                    {strings.dashboard.openMaterial}
                    <ChevronRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
            </div>
        </Link>
    );
};

interface ModuleBentoGridProps {
    materials: LearningModule[];
    toBuilder: (id: string) => string;
    ariaLabelBuilder?: (material: LearningModule) => string;
}

export const ModuleBentoGrid = ({ materials, toBuilder, ariaLabelBuilder }: ModuleBentoGridProps) => {
    const shown = materials.slice(0, BENTO_SLOTS);

    return (
        <div className={GRID_CLASS}>
            {shown.map((material, index) => (
                <BentoCard
                    key={material.id}
                    material={material}
                    to={toBuilder(material.id)}
                    ariaLabel={ariaLabelBuilder?.(material) ?? material.title}
                    featured={index === 0}
                    className={spanClass(index, shown.length)}
                    revealIndex={index}
                />
            ))}
        </div>
    );
};

export const ModuleBentoGridSkeleton = () => (
    <LoadingBlock label={strings.common.loading} className={GRID_CLASS}>
        {Array.from({ length: BENTO_SLOTS }, (_, index) => (
            <div
                key={index}
                className={cn('bg-surface rounded-card flex min-h-52 flex-col justify-end gap-2.5 p-5', spanClass(index, BENTO_SLOTS))}
            >
                <Skeleton className="size-10 rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-1/2" />
            </div>
        ))}
    </LoadingBlock>
);
