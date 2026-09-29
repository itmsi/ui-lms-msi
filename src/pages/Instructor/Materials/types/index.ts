import type { ModuleChapter, ModuleDetail } from '@/types/module';

export type MaterialChapter = ModuleChapter;
export type MaterialDetail = ModuleDetail;

export interface LinkDraft {
    key: string;
    value: string;
}

export interface LessonDraft {
    key: string;
    id: string;
    title: string;
    description: string;
    links: LinkDraft[];
}

export interface MaterialDraft {
    title: string;
    description: string;
    category: string;
    banner: File | null;
    links: LinkDraft[];
    lessons: LessonDraft[];
}

export type DraftErrors = Record<string, string>;

export const createKey = (): string => crypto.randomUUID();

export const createLinkDraft = (): LinkDraft => ({ key: createKey(), value: '' });

export const createLessonDraft = (): LessonDraft => ({
    key: createKey(),
    id: '',
    title: '',
    description: '',
    links: [createLinkDraft()],
});

const toLinkDrafts = (values: string[]): LinkDraft[] => values.map((value) => ({ key: createKey(), value }));

export const toMaterialDraft = (detail: MaterialDetail): MaterialDraft => ({
    title: detail.title,
    description: detail.description,
    category: detail.category ?? '',
    banner: null,
    links: toLinkDrafts(detail.linkMaterials),
    lessons: detail.chapters.map((chapter) => ({
        key: createKey(),
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        links: toLinkDrafts(chapter.linkMaterials),
    })),
});

export const createMaterialDraft = (category: string): MaterialDraft => ({
    title: '',
    description: '',
    category,
    banner: null,
    links: [],
    lessons: [],
});
