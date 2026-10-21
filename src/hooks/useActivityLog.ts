import { useEffect, useMemo, useRef } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { strings } from '@/locales/id';
import { logActivity } from '@/services/activityService';
import type { MaterialLink } from '@/types/module';
import { resolveLinkType } from '@/utils/embedSource';

const lessonLabel = (index: number, title: string): string => `lesson-${String(index + 1)} ${title}`;

export interface LinkContext {
    moduleId: string;
    moduleTitle: string;
    lesson: { index: number; title: string } | null;
}

export const useActivityLog = () => {
    const { user } = useAuth();
    const userId = user?.id ?? null;

    return useMemo(() => {
        const send = (modulesId: string | null, activity: string, file: MaterialLink | null, type: string | null) => {
            if (userId === null) {
                return;
            }

            logActivity({
                createdBy: userId,
                modulesId,
                activity,
                fileName: file === null || file.title === '' ? null : file.title,
                fileLink: file?.link ?? null,
                type,
            });
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
            linkOpened: (material: MaterialLink, { moduleId, moduleTitle, lesson }: LinkContext) => {
                const file = material.title === '' ? material.link : `"${material.title}" (${material.link})`;
                const where =
                    lesson === null
                        ? `${strings.activity.materialContext} ${moduleTitle}`
                        : lessonLabel(lesson.index, lesson.title);

                send(
                    moduleId,
                    `${strings.activity.fileOpened} ${file} ${strings.activity.linkIn} ${where}`,
                    material,
                    resolveLinkType(material.link),
                );
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
