import { ImageOff } from 'lucide-react';
import type { CSSProperties } from 'react';

import { MaterialLinkList } from '@/components/patterns/MaterialLinkList';
import { Accordion } from '@/components/ui/Accordion';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LinkButton } from '@/components/ui/LinkButton';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { ModuleCategoryBadge } from '@/components/ui/ModuleCategoryBadge';
import { RichText } from '@/components/ui/RichText';
import type { ModuleDetailState } from '@/hooks/useModuleDetail';
import { strings } from '@/locales/id';
import { cn } from '@/utils/cn';

interface ModuleDetailViewProps {
    state: ModuleDetailState;
    onRetry: () => void;
    backTo: string;
    backLabel: string;
    titleAs?: 'h1' | 'h3';
    variant: 'library' | 'manage';
}

type Chapter = Extract<ModuleDetailState, { status: 'success' }>['detail']['chapters'][number];

const LessonBody = ({ chapter }: { chapter: Chapter }) => (
    <>
        <div className="mt-3">
            <MaterialLinkList links={chapter.linkMaterials} />
        </div>

        {chapter.description === '' ? null : <RichText html={chapter.description} className="mt-2" />}
    </>
);

const REVEAL_STEP_MS = 80;
const REVEAL_ITEM_STEP_MS = 40;
const REVEAL_MAX_STAGGERED = 6;

const revealFor = (variant: ModuleDetailViewProps['variant']) =>
    variant === 'library'
        ? {
              className: 'motion-rise',
              style: (delayMs: number): CSSProperties => ({ animationDelay: `${String(delayMs)}ms` }),
          }
        : { className: undefined, style: (): CSSProperties => ({}) };

interface LessonAccordionItemProps {
    chapter: Chapter;
    index: number;
    revealDelayMs: number;
}

const LessonAccordionItem = ({ chapter, index, revealDelayMs }: LessonAccordionItemProps) => (
    <li className="motion-rise" style={{ animationDelay: `${String(revealDelayMs)}ms` }}>
        <Accordion
            title={chapter.title}
            eyebrow={
                chapter.linkMaterials.length === 0
                    ? `${strings.materialDetail.lessonPrefix} ${String(index + 1)}`
                    : `${strings.materialDetail.lessonPrefix} ${String(index + 1)} · ${String(chapter.linkMaterials.length)} ${strings.library.materialsSuffix}`
            }
        >
            <LessonBody chapter={chapter} />
        </Accordion>
    </li>
);

const renderError = (
    state: Extract<ModuleDetailState, { status: 'error' }>,
    onRetry: () => void,
    backTo: string,
    backLabel: string,
) => {
    if (state.code === 'not_found') {
        return (
            <EmptyState
                title={strings.materialDetail.notFoundTitle}
                description={strings.materialDetail.notFoundBody}
                action={
                    <LinkButton to={backTo} variant="secondary" size="sm">
                        {backLabel}
                    </LinkButton>
                }
            />
        );
    }

    if (state.code === 'unauthorized') {
        return (
            <ErrorState
                title={strings.materialDetail.unauthorizedTitle}
                whatHappened={strings.apiErrors.unauthorizedHappened}
                whatYouCanDo={strings.apiErrors.unauthorizedDo}
                whatIsNext={strings.apiErrors.unauthorizedNext}
            />
        );
    }

    if (state.code === 'offline') {
        return (
            <ErrorState
                whatHappened={strings.apiErrors.offlineHappened}
                whatYouCanDo={strings.apiErrors.offlineDo}
                whatIsNext={strings.apiErrors.offlineNext}
                onRetry={onRetry}
            />
        );
    }

    if (state.code === 'validation' && state.message !== undefined) {
        return (
            <ErrorState
                whatHappened={state.message}
                whatYouCanDo={strings.apiErrors.validationDo}
                whatIsNext={strings.apiErrors.validationNext}
                onRetry={onRetry}
            />
        );
    }

    return <ErrorState onRetry={onRetry} />;
};

export const ModuleDetailView = ({
    state,
    onRetry,
    backTo,
    backLabel,
    titleAs: TitleTag = 'h3',
    variant,
}: ModuleDetailViewProps) => {
    if (state.status === 'loading') {
        return (
            <LoadingBlock label={strings.common.loading} className="flex flex-col gap-4">
                <Skeleton className="aspect-video w-full max-w-xl" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
            </LoadingBlock>
        );
    }

    if (state.status === 'error') {
        return <Card>{renderError(state, onRetry, backTo, backLabel)}</Card>;
    }

    const { detail } = state;
    const reveal = revealFor(variant);

    return (
        <>
            <Card className={cn('flex flex-col gap-5', reveal.className)} style={reveal.style(0)}>
                <div className="bg-neutral-soft relative aspect-video w-full overflow-hidden rounded-lg">
                    {detail.banner === null ? (
                        <div className="text-neutral-line flex size-full items-center justify-center">
                            <ImageOff aria-hidden="true" className="size-6" />
                            <span className="sr-only">{strings.library.noBanner}</span>
                        </div>
                    ) : (
                        <img src={detail.banner} alt="" loading="lazy" className="size-full object-cover" />
                    )}
                </div>

                <div
                    className={cn(
                        'bg-gradiend z-2 mx-auto flex min-h-22 w-[75%] items-center justify-center rounded-2xl px-7 py-4 text-center',
                        reveal.className,
                    )}
                    style={{ marginTop: '-68px', ...reveal.style(REVEAL_STEP_MS) }}
                >
                    <TitleTag className="text-card font-display line-clamp-2 text-xl font-medium text-white uppercase">
                        {detail.title}
                    </TitleTag>
                </div>

                {variant === 'library' && detail.category !== null ? (
                    <div className='px-5 relative'>
                        <ModuleCategoryBadge category={detail.category} className="absolute top-0 left-3" />
                    </div>
                ) : null}
                {detail.description === '' ? (
                    <p className="text-body text-muted">{strings.materialDetail.noDescription}</p>
                ) : (
                    <RichText className="p-5" html={detail.description} />
                )}
                <div className='p-5'>
                    <MaterialLinkList links={detail.linkMaterials} />
                </div>
            </Card>

            <Card className={cn('flex flex-col gap-4 p-5', reveal.className)} style={reveal.style(REVEAL_STEP_MS * 2)}>
                <h2 className="text-section">{strings.materialDetail.sectionLessons}</h2>

                {detail.chapters.length === 0 ? (
                    <p className="text-body text-muted">{strings.materialDetail.noLessons}</p>
                ) : variant === 'library' ? (
                    <ol className="flex flex-col gap-3">
                        {detail.chapters.map((chapter, index) => (
                            <LessonAccordionItem
                                key={chapter.id}
                                chapter={chapter}
                                index={index}
                                revealDelayMs={
                                    REVEAL_STEP_MS * 3 + Math.min(index, REVEAL_MAX_STAGGERED) * REVEAL_ITEM_STEP_MS
                                }
                            />
                        ))}
                    </ol>
                ) : (
                    <ol className="flex flex-col gap-4">
                        {detail.chapters.map((chapter) => (
                            <li key={chapter.id} className="border-line rounded-card border p-4">
                                <h3 className="text-card text-ink">{chapter.title}</h3>
                                <LessonBody chapter={chapter} />
                            </li>
                        ))}
                    </ol>
                )}
            </Card>
        </>
    );
};
