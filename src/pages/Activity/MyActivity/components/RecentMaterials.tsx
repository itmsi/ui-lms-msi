import { ArrowUpRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

import { strings } from '@/locales/id';
import { BoardLabel } from '@/pages/Activity/MyActivity/components/BoardLabel';
import type { ActivityLog } from '@/types/activity';
import { toModuleTitle } from '@/utils/activityText';
import { formatFullDateTime, formatRelativeTime } from '@/utils/dateTime';
import { staggerDelayMs } from '@/utils/motion';

import '@/components/patterns/sticky-note.css';

const MAX_RECENT = 6;
const REVEAL_STEP_MS = 50;

interface RecentMaterial {
    moduleId: string;
    title: string;
    openedAt: string;
}

const collectRecentMaterials = (items: ActivityLog[]): RecentMaterial[] => {
    const seen = new Set<string>();
    const result: RecentMaterial[] = [];

    for (const item of items) {
        if (item.moduleId === null || seen.has(item.moduleId)) {
            continue;
        }

        const title = item.moduleTitle ?? toModuleTitle(item.activity);

        if (title === null) {
            continue;
        }

        seen.add(item.moduleId);
        result.push({ moduleId: item.moduleId, title, openedAt: item.createdAt });

        if (result.length === MAX_RECENT) {
            break;
        }
    }

    return result;
};

interface RecentMaterialsProps {
    items: ActivityLog[];
    now: number;
}

export const RecentMaterials = ({ items, now }: RecentMaterialsProps) => {
    const materials = collectRecentMaterials(items);

    if (materials.length < 2) {
        return null;
    }

    return (
        <section aria-labelledby="recent-materials" className="flex flex-col gap-1 pt-3">
            <BoardLabel id="recent-materials">
                <BookOpen aria-hidden="true" className="text-primary size-3.5" />
                {strings.activityLog.recentTitle}
            </BoardLabel>

            <ol className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pt-5 pb-4">
                {materials.map((material, index) => (
                    <li
                        key={material.moduleId}
                        className="motion-rise w-44 shrink-0 snap-start sm:w-52"
                        style={{
                            animationDelay: `${String(staggerDelayMs(index, { stepMs: REVEAL_STEP_MS, maxStaggered: MAX_RECENT }))}ms`,
                        }}
                    >
                        <Link
                            to={`/library/${material.moduleId}`}
                            aria-label={`${strings.activityLog.openMaterial}: ${material.title}`}
                            className="sticky-note group block h-full"
                        >
                            <div className="bg-surface flex h-full min-h-32 flex-col justify-between gap-3 p-3 pt-4">
                                <p className="font-display text-card text-primary-dark line-clamp-3">{material.title}</p>
                                <div className="text-caption text-muted flex items-center justify-between gap-2">
                                    <time dateTime={material.openedAt} title={formatFullDateTime(material.openedAt)}>
                                        {formatRelativeTime(material.openedAt, now)}
                                    </time>
                                    <ArrowUpRight
                                        aria-hidden="true"
                                        className="text-primary size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    />
                                </div>
                            </div>
                        </Link>
                    </li>
                ))}
            </ol>
        </section>
    );
};
