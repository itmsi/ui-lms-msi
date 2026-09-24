import type { ModuleChapter, ModuleDetail } from '@/types/module';

/** Detail dipakai juga oleh Perpustakaan, jadi bentuknya tinggal di `types/module`. */
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

/** Dipetakan dengan key: 'title', 'banner', atau key dari LinkDraft/LessonDraft. */
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

/**
 * Menyiapkan form dari materi yang sudah tersimpan.
 * Banner tidak ikut: yang tersimpan berupa URL, sedangkan form memegang berkas baru —
 * banner lama ditampilkan terpisah dan hanya tergantikan bila pengguna memilih gambar.
 */
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

/**
 * Dimulai tanpa lesson: materi ringkas cukup diisi informasi dan tautannya saja.
 * Membuka form dengan satu lesson kosong membuat lesson terasa wajib padahal bukan.
 */
export const createMaterialDraft = (category: string): MaterialDraft => ({
    title: '',
    description: '',
    category,
    banner: null,
    links: [],
    lessons: [],
});
