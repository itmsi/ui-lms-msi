import { ArrowRight, LibraryBig } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LinkButton } from '@/components/ui/LinkButton';
import { useTrackModules } from '@/hooks/useTrackModules';
import type { TrackModulesState } from '@/hooks/useTrackModules';
import { strings } from '@/locales/id';
import { BENTO_SLOTS, ModuleBentoGrid, ModuleBentoGridSkeleton } from '@/pages/Candidate/Dashboard/components/ModuleBentoGrid';
import { ModuleFeatureGrid, ModuleFeatureGridSkeleton } from '@/pages/Candidate/Dashboard/components/ModuleFeatureGrid';
import type { TrackCategory } from '@/pages/Candidate/TrackDetail/track';

const TRACK_SECTION_LIMIT = 5;

const renderError = (state: Extract<TrackModulesState, { status: 'error' }>, onRetry: () => void) => {
    if (state.code === 'unauthorized') {
        return (
            <ErrorState
                title={strings.dashboard.unauthorizedTitle}
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

interface TrackSectionProps {
    title: string;
    category: TrackCategory;
    layout?: 'bento' | 'featured';
}

export const TrackSection = ({ title, category, layout = 'bento' }: TrackSectionProps) => {
    const { state, retry } = useTrackModules(category, layout === 'bento' ? BENTO_SLOTS : TRACK_SECTION_LIMIT);

    const hasMore = state.status === 'success' && state.result.pagination.total > state.result.items.length;

    return (
        <section className="flex flex-col gap-3 rounded-card">
            <div
            // style={{
            //     padding: "1rem",
            //     background: "#ebebeb",
            //     borderRadius: "4px",
            //     boxShadow: `
            //     inset 0 3px 6px rgba(0, 0, 0, 0.8),
            //     0 1px 1px rgba(255, 255, 255, 0.1)
            // `,
            // }}
            >
                <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="text-section text-2xl">{title}</h2>

                    {hasMore ? (
                        <LinkButton
                            to={`/tracks/${category}`}
                            variant="ghost"
                            size="sm"
                            trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}
                        >
                            {strings.dashboard.viewAll}
                        </LinkButton>
                    ) : null}
                </div>

                {state.status === 'loading' ? (
                    layout === 'featured' ? (
                        <ModuleFeatureGridSkeleton count={TRACK_SECTION_LIMIT} />
                    ) : (
                        <ModuleBentoGridSkeleton />
                    )
                ) : null}

                {state.status === 'error' ? <Card>{renderError(state, retry)}</Card> : null}

                {state.status === 'success' && state.result.items.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={LibraryBig}
                            title={strings.dashboard.sectionEmptyTitle}
                            description={strings.dashboard.sectionEmptyBody}
                        />
                    </Card>
                ) : null}

                {state.status === 'success' && state.result.items.length > 0 && layout === 'featured' ? (
                    <ModuleFeatureGrid
                        materials={state.result.items}
                        toBuilder={() => `/tracks/${category}`}
                        ariaLabelBuilder={(material) => `${strings.dashboard.viewAll}: ${title} · ${material.title}`}
                    />
                ) : null}

                {state.status === 'success' && state.result.items.length > 0 && layout === 'bento' ? (
                    <ModuleBentoGrid
                        materials={state.result.items}
                        toBuilder={() => `/tracks/${category}`}
                        ariaLabelBuilder={(material) => `${strings.dashboard.viewAll}: ${title} · ${material.title}`}
                    />
                ) : null}
            </div>
        </section>
    );
};
