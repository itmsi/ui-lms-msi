import { useEffect, useMemo, useRef } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { strings } from '@/locales/id';
import { logActivity } from '@/services/activityService';
import { resolveLinkType } from '@/utils/embedSource';

export const lessonLabel = (index: number, title: string): string => `lesson-${String(index + 1)} ${title}`;

export interface LinkContext {
    moduleId: string;
    moduleTitle: string;
    lesson: { index: number; title: string } | null;
}

export const useActivityLog = () => {
    const { user } = useAuth();
    const userId = user?.id ?? null;

    return useMemo(() => {
        const send = (modulesId: string | null, activity: string, fileName: string | null, type: string | null) => {
            if (userId === null) {
                return;
            }

            logActivity({ createdBy: userId, modulesId, activity, fileName, type });
        };

        return {
            trackOpened: (trackLabel: string) => {
                send(null, `${strings.activity.trackOpened} ${trackLabel}`, null, null);
            },
            moduleOpened: (moduleId: string, moduleTitle: string) => {
                send(moduleId, `${strings.activity.moduleOpened} ${moduleTitle}`, null, null);
            },
            lessonOpened: (moduleId: string, index: number, lessonTitle: string) => {
                send(moduleId, lessonLabel(index, lessonTitle), null, null);
            },
            linkOpened: (link: string, { moduleId, moduleTitle, lesson }: LinkContext) => {
                const type = resolveLinkType(link);
                const target = type === null ? strings.activity.linkOpened : `${strings.activity.linkOpened} ${type}`;
                const where =
                    lesson === null
                        ? `${strings.activity.materialContext} ${moduleTitle}`
                        : lessonLabel(lesson.index, lesson.title);

                send(moduleId, `${target} ${strings.activity.linkIn} ${where}`, link, type);
            },
        };
    }, [userId]);
};

export const useLogOnce = (key: string | null, log: () => void) => {
    const loggedKey = useRef<string | null>(null);

    useEffect(() => {
        if (key === null || loggedKey.current === key) {
            return;
        }

        loggedKey.current = key;
        log();
    }, [key, log]);
};
