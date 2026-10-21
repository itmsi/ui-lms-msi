import { useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { ModuleDetailView } from '@/components/patterns/ModuleDetailView';
import type { LessonRef } from '@/components/patterns/ModuleDetailView';
import { useActivityLog, useLogOnce } from '@/hooks/useActivityLog';
import { useModuleDetail } from '@/hooks/useModuleDetail';
import { strings } from '@/locales/id';
import type { MaterialLink } from '@/types/module';

export const LibraryDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { state, retry } = useModuleDetail(id);
    const activity = useActivityLog();
    const openedLessons = useRef(new Set<string>());

    const detail = state.status === 'success' ? state.detail : null;

    useLogOnce(detail?.id ?? null, () => {
        if (detail !== null) {
            activity.moduleOpened(detail.id, detail.title);
        }
    });

    const handleLessonOpen = useCallback(
        ({ chapter, index }: LessonRef) => {
            if (detail === null) {
                return;
            }

            const key = `${detail.id}:${chapter.id}`;

            if (openedLessons.current.has(key)) {
                return;
            }

            openedLessons.current.add(key);
            activity.lessonOpened(detail.id, index, chapter.title);
        },
        [activity, detail],
    );

    const handleLinkOpen = useCallback(
        (material: MaterialLink, lesson: LessonRef | null) => {
            if (detail === null) {
                return;
            }

            activity.linkOpened(material, {
                moduleId: detail.id,
                moduleTitle: detail.title,
                lesson: lesson === null ? null : { index: lesson.index, title: lesson.chapter.title },
            });
        },
        [activity, detail],
    );

    return (
        <section className="flex flex-col gap-5">
            <ModuleDetailView
                state={state}
                onRetry={retry}
                backTo="/library"
                backLabel={strings.library.backToLibrary}
                titleAs="h1"
                variant="library"
                onLessonOpen={handleLessonOpen}
                onLinkOpen={handleLinkOpen}
            />
        </section>
    );
};

export default LibraryDetail;
