import { Construction, LibraryBig } from 'lucide-react';

import { ModuleRowList, ModuleRowListSkeleton } from '@/components/patterns/ModuleRowList';
import PageHeaderDetail from '@/components/patterns/PageHeaderDetail';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useTrackModules } from '@/hooks/useTrackModules';
import type { TrackModulesState } from '@/hooks/useTrackModules';
import { strings } from '@/locales/id';
import type { TrackInfo } from '@/pages/Candidate/TrackDetail/track';

const TRACK_LIST_LIMIT = 50;

const renderError = (state: Extract<TrackModulesState, { status: 'error' }>, onRetry: () => void) => {
    if (state.code === 'unauthorized') {
        return (
            <ErrorState
                title={strings.trackDetail.unauthorizedTitle}
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

interface TrackDetailContentProps {
    track: TrackInfo;
}

export const TrackDetailContent = ({ track }: TrackDetailContentProps) => {
    const { state, retry } = useTrackModules(track.category, TRACK_LIST_LIMIT);

    return (
        <section className="flex flex-col gap-5">
            <PageHeaderDetail title={track.label} subtitle={track.description} backPath="/dashboard" />

            {track.category === 'mt' ? (
                <Card className="flex items-start gap-3 p-4">
                    <span className="bg-neutral-soft text-neutral-ink flex size-9 shrink-0 items-center justify-center rounded-full">
                        <Construction aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                        <p className="text-card text-ink">{strings.trackDetail.capstoneTitle}</p>
                        <p className="text-body text-muted">{strings.trackDetail.capstoneBody}</p>
                    </div>
                </Card>
            ) : null}

            {state.status === 'loading' ? <ModuleRowListSkeleton count={6} /> : null}

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
                <ModuleRowList
                    materials={state.result.items}
                    toBuilder={(id) => `/library/${id}`}
                    showCategoryBadge={false}
                />
            ) : null}
        </section>
    );
};
