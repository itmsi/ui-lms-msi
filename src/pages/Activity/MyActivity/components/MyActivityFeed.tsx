import { Footprints, RotateCcw, SearchX } from 'lucide-react';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LinkButton } from '@/components/ui/LinkButton';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { WoodPanel } from '@/components/ui/WoodPanel';
import { strings } from '@/locales/id';
import { ActivityTimeline } from '@/pages/Activity/MyActivity/components/ActivityTimeline';
import { BoardLabel } from '@/pages/Activity/MyActivity/components/BoardLabel';
import { RecentMaterials } from '@/pages/Activity/MyActivity/components/RecentMaterials';
import { ResumeCard } from '@/pages/Activity/MyActivity/components/ResumeCard';
import type { ActivityLog } from '@/types/activity';
import type { ApiFailureCode } from '@/types/module';

const TimelineSkeleton = ({ count }: { count: number }) => (
    <LoadingBlock label={strings.common.loading} className="flex flex-col gap-5">
        {Array.from({ length: count }, (_, index) => (
            <div key={index} className="flex gap-3">
                <Skeleton className="bg-surface/80 size-9 shrink-0 rounded-full" />
                <div className="bg-surface flex flex-1 flex-col gap-2 rounded-md p-3 shadow-[0_1px_2px_rgb(0_0_0/0.25)]">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                </div>
            </div>
        ))}
    </LoadingBlock>
);

const findResumeItem = (items: ActivityLog[]) => items.find((item): item is ActivityLog & { moduleId: string } => item.moduleId !== null);

interface MyActivityFeedProps {
    status: 'loading' | 'error' | 'ready';
    items: ActivityLog[];
    total: number | null;
    failure: { code: ApiFailureCode; message?: string } | null;
    isLoadingMore: boolean;
    loadMoreFailed: boolean;
    hasMore: boolean;
    moduleId: string | null;
    hasFilters: boolean;
    pageSize: number;
    now: number;
    onClearFilters: () => void;
    onWidenRange: () => void;
    onReload: () => void;
    onLoadMore: () => void;
    onRetryMore: () => void;
    onFilterModule: (moduleId: string) => void;
}

export const MyActivityFeed = ({
    status,
    items,
    total,
    failure,
    isLoadingMore,
    loadMoreFailed,
    hasMore,
    moduleId,
    hasFilters,
    pageSize,
    now,
    onClearFilters,
    onWidenRange,
    onReload,
    onLoadMore,
    onRetryMore,
    onFilterModule,
}: MyActivityFeedProps) => {
    const resumeItem = hasFilters ? undefined : findResumeItem(items);
    const remaining = total === null ? 0 : total - items.length;

    return (
        <WoodPanel className="flex flex-col gap-6">
            {resumeItem === undefined ? null : <ResumeCard item={resumeItem} now={now} />}

            {hasFilters ? null : <RecentMaterials items={items} now={now} />}

            {status === 'loading' ? <TimelineSkeleton count={5} /> : null}

            {status === 'error' && failure !== null ? (
                <Card>
                    <ApiErrorState
                        code={failure.code}
                        message={failure.message}
                        unauthorizedTitle={strings.activityLog.unauthorizedTitle}
                        onRetry={onReload}
                    />
                </Card>
            ) : null}

            {status === 'ready' && items.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={hasFilters ? SearchX : Footprints}
                        title={hasFilters ? strings.activityLog.filteredEmptyTitle : strings.activityLog.recentEmptyTitle}
                        description={hasFilters ? strings.activityLog.filteredEmptyBody : strings.activityLog.recentEmptyBody}
                        action={
                            hasFilters ? (
                                <Button variant="secondary" size="sm" onClick={onClearFilters}>
                                    {strings.library.clearFilters}
                                </Button>
                            ) : (
                                <div className="flex flex-wrap justify-center gap-2">
                                    <Button variant="secondary" size="sm" onClick={onWidenRange}>
                                        {strings.activityLog.widenRange}
                                    </Button>
                                    <LinkButton to="/" size="sm">
                                        {strings.activityLog.emptyAction}
                                    </LinkButton>
                                </div>
                            )
                        }
                    />
                </Card>
            ) : null}

            {status === 'ready' && items.length > 0 ? (
                <>
                    <ActivityTimeline items={items} now={now} canFilterModule={moduleId === null} onFilterModule={onFilterModule} />

                    {loadMoreFailed ? (
                        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                            <p className="text-body text-ink">{strings.activityLog.loadMoreFailed}</p>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={onRetryMore}
                                leadingIcon={<RotateCcw aria-hidden="true" className="size-4" />}
                            >
                                {strings.common.retry}
                            </Button>
                        </Card>
                    ) : null}

                    {isLoadingMore ? <TimelineSkeleton count={Math.min(3, pageSize)} /> : null}

                    {hasMore && isLoadingMore === false && loadMoreFailed === false ? (
                        <Button variant="secondary" fullWidth onClick={onLoadMore}>
                            {`${strings.activityLog.loadMore} (${String(remaining)} ${strings.activityLog.remainingSuffix})`}
                        </Button>
                    ) : null}

                    {hasMore === false ? (
                        <BoardLabel as="p" pinned={false} className="mx-auto rotate-1 tracking-normal normal-case">
                            {strings.activityLog.endOfList}
                        </BoardLabel>
                    ) : null}
                </>
            ) : null}
        </WoodPanel>
    );
};
