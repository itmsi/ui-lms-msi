import { ArrowRight, LibraryBig } from 'lucide-react';

import { ModuleThumbnailGrid, ModuleThumbnailGridSkeleton } from '@/components/patterns/ModuleThumbnailGrid';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LinkButton } from '@/components/ui/LinkButton';
import { useTrackModules } from '@/hooks/useTrackModules';
import type { TrackModulesState } from '@/hooks/useTrackModules';
import { strings } from '@/locales/id';
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
}

export const TrackSection = ({ title, category }: TrackSectionProps) => {
    const { state, retry } = useTrackModules(category, TRACK_SECTION_LIMIT);

    const hasMore = state.status === 'success' && state.result.pagination.total > state.result.items.length;

    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-section">{title}</h2>

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

            {state.status === 'loading' ? <ModuleThumbnailGridSkeleton count={TRACK_SECTION_LIMIT} /> : null}

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

            {state.status === 'success' && state.result.items.length > 0 ? (
                <ModuleThumbnailGrid
                    materials={state.result.items}
                    showCategoryBadge={false}
                    toBuilder={() => `/tracks/${category}`}
                    ariaLabelBuilder={() => `${strings.dashboard.viewAll}: ${title}`}
                />
            ) : null}
        </section>
    );
};
