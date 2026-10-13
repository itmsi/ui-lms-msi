import { Footprints, RotateCcw, SearchX } from 'lucide-react';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import { DateRangeFilter } from '@/components/patterns/DateRangeFilter';
import { PageHeader } from '@/components/patterns/PageHeader';
import { SearchBar } from '@/components/patterns/SearchBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterChip } from '@/components/ui/FilterChip';
import { LinkButton } from '@/components/ui/LinkButton';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import type { SegmentedOption } from '@/components/ui/SegmentedControl';
import { WoodPanel } from '@/components/ui/WoodPanel';
import { useNow } from '@/hooks/useNow';
import { strings } from '@/locales/id';
import { ActivityTimeline } from '@/pages/Activity/MyActivity/components/ActivityTimeline';
import { BoardLabel } from '@/pages/Activity/MyActivity/components/BoardLabel';
import { RecentMaterials } from '@/pages/Activity/MyActivity/components/RecentMaterials';
import { ResumeCard } from '@/pages/Activity/MyActivity/components/ResumeCard';
import { useMyActivity } from '@/pages/Activity/MyActivity/hooks/useMyActivity';
import type { RangePreset } from '@/pages/Activity/MyActivity/hooks/useMyActivity';
import type { ActivityLog } from '@/types/activity';
import { findModuleTitle } from '@/utils/activityText';
import { toIsoDate } from '@/utils/dateTime';

const NOW_TICK_MS = 60_000;

const RANGE_OPTIONS: SegmentedOption<RangePreset>[] = [
    { value: '7d', label: strings.activityLog.rangePreset['7d'] },
    { value: '30d', label: strings.activityLog.rangePreset['30d'] },
    { value: '90d', label: strings.activityLog.rangePreset['90d'] },
];

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

export const MyActivity = () => {
    const now = useNow(NOW_TICK_MS);
    const {
        status,
        items,
        total,
        failure,
        isLoadingMore,
        loadMoreFailed,
        hasMore,
        search,
        moduleId,
        rangePreset,
        dateRange,
        hasFilters,
        pageSize,
        submitSearch,
        selectModule,
        selectPreset,
        selectCustomRange,
        clearFilters,
        reload,
        loadMore,
        retryMore,
    } = useMyActivity();

    const resumeItem = hasFilters ? undefined : findResumeItem(items);
    const remaining = total === null ? 0 : total - items.length;

    return (
        <section className="mx-auto flex w-full flex-col gap-5">
            <PageHeader title={strings.nav.myActivity} description={strings.activityLog.mySubtitle} />

            <SearchBar
                label={strings.activityLog.searchLabel}
                placeholder={strings.activityLog.searchPlaceholder}
                value={search}
                onSubmit={submitSearch}
                hasFilters={hasFilters}
                onClear={clearFilters}
                disabled={status === 'loading'}
            />

            <DateRangeFilter
                presets={RANGE_OPTIONS}
                preset={rangePreset}
                range={dateRange}
                max={toIsoDate(new Date(now))}
                onSelectPreset={selectPreset}
                onChangeRange={selectCustomRange}
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
                <p aria-live="polite" className="text-caption text-muted tabular-nums">
                    {total === null ? ' ' : `${String(total)} ${strings.activityLog.totalSuffix}`}
                </p>

                {moduleId === null ? null : (
                    <FilterChip
                        label={strings.activityLog.filterModuleChip}
                        value={findModuleTitle(items, moduleId) ?? strings.activityLog.thisMaterial}
                        onRemove={() => selectModule(null)}
                    />
                )}
            </div>

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
                            onRetry={reload}
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
                                    <Button variant="secondary" size="sm" onClick={clearFilters}>
                                        {strings.library.clearFilters}
                                    </Button>
                                ) : (
                                    <div className="flex flex-wrap justify-center gap-2">
                                        <Button variant="secondary" size="sm" onClick={() => selectPreset('30d')}>
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
                        <ActivityTimeline items={items} now={now} canFilterModule={moduleId === null} onFilterModule={selectModule} />

                        {loadMoreFailed ? (
                            <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                                <p className="text-body text-ink">{strings.activityLog.loadMoreFailed}</p>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={retryMore}
                                    leadingIcon={<RotateCcw aria-hidden="true" className="size-4" />}
                                >
                                    {strings.common.retry}
                                </Button>
                            </Card>
                        ) : null}

                        {isLoadingMore ? <TimelineSkeleton count={Math.min(3, pageSize)} /> : null}

                        {hasMore && loadMore !== undefined && isLoadingMore === false && loadMoreFailed === false ? (
                            <Button variant="secondary" fullWidth onClick={loadMore}>
                                {`${strings.activityLog.loadMore} (${String(remaining)} ${strings.activityLog.remainingSuffix})`}
                            </Button>
                        ) : null}

                        {hasMore === false ? (
                            <BoardLabel as="p" pinned={false} className="mx-auto rotate-1 normal-case tracking-normal">
                                {strings.activityLog.endOfList}
                            </BoardLabel>
                        ) : null}
                    </>
                ) : null}
            </WoodPanel>
        </section>
    );
};

export default MyActivity;
