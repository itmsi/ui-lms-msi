import { BookOpen, ExternalLink, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ActivityKindIcon } from '@/components/patterns/ActivityKindIcon';
import { strings } from '@/locales/id';
import { BoardLabel } from '@/pages/Activity/MyActivity/components/BoardLabel';
import type { ActivityLog } from '@/types/activity';
import { toActivityDisplay, toActivityKind } from '@/utils/activityText';
import { cn } from '@/utils/cn';
import { formatClock, formatDayLabel, formatFullDateTime, formatRelativeTime, toDayKey } from '@/utils/dateTime';
import { staggerDelayMs } from '@/utils/motion';

const REVEAL_STEP_MS = 30;
const REVEAL_MAX_STAGGERED = 9;
const TILTS = ['-rotate-[0.5deg]', 'rotate-[0.4deg]', '-rotate-[0.15deg]'];

interface DayGroup {
    key: string;
    label: string;
    items: ActivityLog[];
}

const groupByDay = (items: ActivityLog[], now: number): DayGroup[] => {
    const groups: DayGroup[] = [];

    for (const item of items) {
        const key = toDayKey(item.createdAt);
        const last = groups.at(-1);

        if (last !== undefined && last.key === key) {
            last.items.push(item);
        } else {
            groups.push({
                key,
                label: formatDayLabel(item.createdAt, now),
                items: [item],
            });
        }
    }

    return groups;
};

const actionClass =
    'text-caption text-primary hover:bg-primary-light focus-visible:outline-primary inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 font-medium transition-colors focus-visible:outline-2';

interface TimelineItemProps {
    item: ActivityLog;
    isToday: boolean;
    isLast: boolean;
    revealIndex: number;
    now: number;
    canFilterModule: boolean;
    onFilterModule: (moduleId: string) => void;
}

const TimelineItem = ({ item, isToday, isLast, revealIndex, now, canFilterModule, onFilterModule }: TimelineItemProps) => {
    const kind = toActivityKind(item);
    const display = toActivityDisplay(item.activity);
    const showDisplay = item.moduleTitle === null || kind !== 'module';

    return (
        <li
            className="motion-rise relative flex gap-3 pb-5"
            style={{
                animationDelay: `${String(staggerDelayMs(revealIndex, { stepMs: REVEAL_STEP_MS, maxStaggered: REVEAL_MAX_STAGGERED }))}ms`,
            }}
        >
            {isLast ? null : (
                <span aria-hidden="true" className="absolute top-11 bottom-1 left-4.25 border-l-2 border-dashed border-white/45" />
            )}

            <ActivityKindIcon kind={kind} className="relative z-1 ring-2 ring-white/85 shadow-[0_3px_6px_rgb(0_0_0/0.45)]" />

            <article
                className={cn(
                    'bg-surface flex min-w-0 flex-1 flex-col gap-1.5 rounded-md p-3 shadow-[0_1px_2px_rgb(0_0_0/0.25),0_12px_16px_-10px_rgb(0_0_0/0.6)]',
                    'transition-[rotate,translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:rotate-0 focus-within:-translate-y-0.5 focus-within:rotate-0',
                    'hover:shadow-[0_2px_4px_rgb(0_0_0/0.25),0_18px_24px_-12px_rgb(0_0_0/0.65)]',
                    TILTS[revealIndex % TILTS.length],
                )}
            >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span className="bg-primary-light text-primary-dark text-caption rounded-full px-2 py-0.5 font-medium">
                        {strings.activityLog.kind[kind]}
                    </span>
                    <time
                        dateTime={item.createdAt}
                        title={formatFullDateTime(item.createdAt)}
                        className="text-caption text-muted shrink-0 tabular-nums"
                    >
                        {isToday ? formatRelativeTime(item.createdAt, now) : formatClock(item.createdAt)}
                    </time>
                </div>

                {item.moduleTitle === null ? null : (
                    <h3 className="font-display text-card text-primary-dark line-clamp-2">{item.moduleTitle}</h3>
                )}

                {showDisplay ? <p className="text-body text-ink min-w-0 wrap-break-word">{display}</p> : null}

                <div className="-ml-2.5 flex flex-wrap items-center gap-1">
                    {item.moduleId === null ? null : (
                        <Link to={`/library/${item.moduleId}`} className={actionClass}>
                            <BookOpen aria-hidden="true" className="size-3.5" />
                            {strings.activityLog.openMaterial}
                        </Link>
                    )}

                    {item.fileName === null ? null : (
                        <a href={item.fileName} target="_blank" rel="noopener noreferrer" className={actionClass}>
                            <ExternalLink aria-hidden="true" className="size-3.5" />
                            {item.type === null ? strings.activityLog.openLinkAgain : `${strings.activityLog.openLinkAgain} · ${item.type}`}
                        </a>
                    )}

                    {canFilterModule && item.moduleId !== null ? (
                        <button
                            type="button"
                            onClick={() => onFilterModule(item.moduleId ?? '')}
                            className={cn(actionClass, 'text-muted hover:text-primary-dark')}
                        >
                            <Filter aria-hidden="true" className="size-3.5" />
                            {strings.activityLog.filterByModule}
                        </button>
                    ) : null}
                </div>
            </article>
        </li>
    );
};

interface ActivityTimelineProps {
    items: ActivityLog[];
    now: number;
    canFilterModule: boolean;
    onFilterModule: (moduleId: string) => void;
}

export const ActivityTimeline = ({ items, now, canFilterModule, onFilterModule }: ActivityTimelineProps) => {
    const groups = groupByDay(items, now);
    const todayLabel = strings.activityLog.today;

    return (
        <div className="flex flex-col gap-6">
            {groups.map((group) => (
                <section key={group.key} aria-labelledby={`day-${group.key}`} className="flex flex-col gap-4">
                    <BoardLabel id={`day-${group.key}`} className="sticky top-5 z-2">
                        {group.label}
                        <span className="bg-primary text-caption rounded-full px-2 py-0.5 text-white tabular-nums normal-case">
                            {group.items.length}
                        </span>
                    </BoardLabel>

                    <ol>
                        {group.items.map((item, index) => (
                            <TimelineItem
                                key={item.id}
                                item={item}
                                isToday={group.label === todayLabel}
                                isLast={index === group.items.length - 1}
                                revealIndex={index}
                                now={now}
                                canFilterModule={canFilterModule}
                                onFilterModule={onFilterModule}
                            />
                        ))}
                    </ol>
                </section>
            ))}
        </div>
    );
};
