import { strings } from '@/locales/id';
import type { ActivityKind, ActivityLog } from '@/types/activity';

const LESSON_PREFIX = /^lesson-(\d+)\s+/;
const LESSON_TOKEN = /lesson-(\d+)/g;

export const toActivityKind = ({ activity, type }: Pick<ActivityLog, 'activity' | 'type'>): ActivityKind => {
    if (
        type !== null ||
        activity.startsWith(strings.activity.fileOpened) ||
        activity.startsWith(strings.activity.linkOpened)
    ) {
        return 'link';
    }

    if (activity.startsWith(strings.activity.trackOpened)) {
        return 'track';
    }

    if (activity.startsWith(strings.activity.moduleOpened)) {
        return 'module';
    }

    return LESSON_PREFIX.test(activity) ? 'lesson' : 'other';
};

export const toActivityDisplay = (activity: string): string => {
    const readable = activity.replace(LESSON_TOKEN, `${strings.activityLog.lessonWord} $1`);

    return LESSON_PREFIX.test(activity) ? `${strings.activityLog.openedPrefix} ${readable}` : readable;
};

export const toModuleTitle = (activity: string): string | null => {
    const moduleOpened = `${strings.activity.moduleOpened} `;

    if (activity.startsWith(moduleOpened)) {
        return activity.slice(moduleOpened.length).trim() || null;
    }

    const marker = ` ${strings.activity.linkIn} ${strings.activity.materialContext} `;
    const markerIndex = activity.indexOf(marker);

    return markerIndex === -1 ? null : activity.slice(markerIndex + marker.length).trim() || null;
};

export const findModuleTitle = (items: ActivityLog[], moduleId: string): string | null => {
    for (const item of items) {
        if (item.moduleId === moduleId) {
            const title = item.moduleTitle ?? toModuleTitle(item.activity);

            if (title !== null) {
                return title;
            }
        }
    }

    return null;
};
