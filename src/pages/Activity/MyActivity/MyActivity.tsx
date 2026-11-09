import { useNow } from '@/hooks/useNow';
import { FilterSection } from '@/pages/Activity/MyActivity/components/FilterSection';
import { MyActivityFeed } from '@/pages/Activity/MyActivity/components/MyActivityFeed';
import { useMyActivity } from '@/pages/Activity/MyActivity/hooks/useMyActivity';

const NOW_TICK_MS = 60_000;

export const MyActivity = () => {
    const now = useNow(NOW_TICK_MS);
    const activity = useMyActivity(now);

    return (
        <section className="mx-auto flex w-full flex-col gap-5">
            <FilterSection
                searchValue={activity.search}
                moduleId={activity.moduleId}
                moduleTitle={activity.moduleTitle}
                rangePreset={activity.rangePreset}
                dateRange={activity.dateRange}
                now={now}
                hasFilters={activity.hasFilters}
                disabled={activity.status === 'loading'}
                onSearchSubmit={activity.submitSearch}
                onSelectModule={activity.selectModule}
                onSelectPreset={activity.selectPreset}
                onChangeRange={activity.selectCustomRange}
                onClearFilters={activity.clearFilters}
            />

            <MyActivityFeed
                status={activity.status}
                items={activity.items}
                total={activity.total}
                failure={activity.failure}
                isLoadingMore={activity.isLoadingMore}
                loadMoreFailed={activity.loadMoreFailed}
                hasMore={activity.hasMore}
                moduleId={activity.moduleId}
                hasFilters={activity.hasFilters}
                pageSize={activity.pageSize}
                now={now}
                onClearFilters={activity.clearFilters}
                onWidenRange={() => activity.selectPreset('30d')}
                onReload={activity.reload}
                onLoadMore={activity.loadMore}
                onRetryMore={activity.retryMore}
                onFilterModule={activity.selectModule}
            />
        </section>
    );
};

export default MyActivity;
