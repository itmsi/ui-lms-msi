import { readEnvelope } from '@/helpers/apiEnvelope';
import { apiDelete, apiGet, apiPostMultipart, apiPutMultipart } from '@/helpers/apiHelper';
import { isRecord } from '@/helpers/authParsers';
import type {
    LinkDraft,
    MaterialChapter,
    MaterialDetail,
    MaterialDraft,
} from '@/pages/Instructor/Materials/types';
import { toApiFailureCode } from '@/services/moduleService';
import type { ApiFailureCode } from '@/types/module';

const CREATE_PATH = 'modules/create-all';

const detailPath = (id: string) => `modules/get/${encodeURIComponent(id)}`;

/*
 * CONTRACT: kedua jalur di bawah diberikan pengguna tanpa method. Probe tidak bisa
 * memastikannya — guard auth menjawab 401 sebelum routing method dijalankan, jadi
 * semua method terlihat "ada". Dipilih mengikuti konvensi API ini: `create-all` POST,
 * jadi `update-all` PUT dan `delete-all` DELETE. Perlu dikonfirmasi backend.
 */
const updatePath = (id: string) => `modules/update-all/${encodeURIComponent(id)}`;
const deletePath = (id: string) => `modules/delete-all/${encodeURIComponent(id)}`;

export type SaveMaterialOutcome =
    | { ok: true; id: string | null }
    | { ok: false; code: ApiFailureCode; message?: string };

export type DeleteMaterialOutcome = { ok: true } | { ok: false; code: ApiFailureCode; message?: string };

/**
 * Backend menyebut unit di dalam Module sebagai **chapter**; produk dan UI menyebutnya
 * **lesson**. Penerjemahannya sengaja hanya terjadi di berkas ini, supaya istilah di
 * layar tidak ikut berubah mengikuti penamaan backend.
 */
interface ChapterPayload {
    /** Kosong berarti chapter baru; terisi berarti chapter lama yang diperbarui. */
    id: string;
    /** Urutan tampil, mulai dari 1. */
    line: number;
    title: string;
    description: string;
    link_materials: string[];
}

const toLinkValues = (links: LinkDraft[]): string[] =>
    links.map((link) => link.value.trim()).filter((value) => value !== '');

const buildFormData = (draft: MaterialDraft): FormData => {
    const form = new FormData();

    form.append('title', draft.title.trim());
    form.append('module_category', draft.category);

    if (draft.description !== '') {
        form.append('description', draft.description);
    }

    const links = toLinkValues(draft.links);

    if (links.length > 0) {
        /*
         * Dipisah koma, mengikuti bentuk yang sudah terbukti diterima backend.
         * Catatan: URL yang mengandung koma akan terpecah salah di sisi server —
         * belum pernah terjadi dengan tautan WeDrive, tapi perlu diingat.
         */
        form.append('link_materials', links.join(','));
    }

    /*
     * CONTRACT: saat update, banner yang tidak diganti tidak dikirim sama sekali.
     * Apakah backend menafsirkan field yang absen sebagai "biarkan banner lama" atau
     * "hapus banner" belum dipastikan — begitu juga kasus pengguna sengaja menghapus
     * banner lama tanpa memilih yang baru (tidak ada cara eksplisit menyatakannya di sini).
     */
    if (draft.banner !== null) {
        form.append('banner', draft.banner);
    }

    /*
     * CONTRACT: saat update, yang dikirim hanya chapter yang tersisa di form.
     * Apakah backend menghapus chapter lama yang tidak ikut terkirim belum dipastikan.
     */
    const chapters: ChapterPayload[] = draft.lessons.map((lesson, index) => ({
        id: lesson.id,
        line: index + 1,
        title: lesson.title.trim(),
        description: lesson.description,
        link_materials: toLinkValues(lesson.links),
    }));

    if (chapters.length > 0) {
        // Berbeda dari `link_materials`: chapter dikirim sebagai satu string JSON.
        form.append('chapters', JSON.stringify(chapters));
    }

    return form;
};

export type MaterialDetailOutcome =
    | { ok: true; data: MaterialDetail }
    | { ok: false; code: ApiFailureCode | 'not_found'; message?: string };

const readString = (value: unknown): string | null => (typeof value === 'string' && value !== '' ? value : null);

const toStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? (value as unknown[]).filter((item): item is string => typeof item === 'string') : [];

const toChapter = (value: unknown, fallbackLine: number): MaterialChapter | null => {
    if (isRecord(value) === false || typeof value.id !== 'string') {
        return null;
    }

    return {
        id: value.id,
        title: readString(value.title) ?? '',
        description: readString(value.description) ?? '',
        linkMaterials: toStringArray(value.link_materials),
        line: typeof value.line === 'number' && Number.isFinite(value.line) ? value.line : fallbackLine,
    };
};

const toDetail = (value: unknown): MaterialDetail | null => {
    if (isRecord(value) === false || typeof value.id !== 'string') {
        return null;
    }

    const rawChapters = Array.isArray(value.chapters) ? (value.chapters as unknown[]) : [];

    return {
        id: value.id,
        title: readString(value.title) ?? '',
        description: readString(value.description) ?? '',
        banner: readString(value.banner),
        linkMaterials: toStringArray(value.link_materials),
        category: readString(value.module_category),
        // Diurutkan dari `line`, bukan dari urutan array — urutan belajar milik backend.
        chapters: rawChapters
            .map((chapter, index) => toChapter(chapter, index + 1))
            .filter((chapter): chapter is MaterialChapter => chapter !== null)
            .sort((left, right) => left.line - right.line),
    };
};

export const fetchMaterialDetail = async (id: string, signal?: AbortSignal): Promise<MaterialDetailOutcome> => {
    if (navigator.onLine === false) {
        return { ok: false, code: 'offline' };
    }

    try {
        const { data: body } = await apiGet<unknown>(detailPath(id), undefined, { signal });
        const envelope = readEnvelope(body);

        if (envelope.ok === false) {
            return envelope.message === null
                ? { ok: false, code: 'not_found' }
                : { ok: false, code: 'validation', message: envelope.message };
        }

        const detail = toDetail(envelope.data);

        return detail === null ? { ok: false, code: 'not_found' } : { ok: true, data: detail };
    } catch (error) {
        const status = isRecord(error) && typeof error.status === 'number' ? error.status : null;

        return status === 404 ? { ok: false, code: 'not_found' } : { ok: false, code: toApiFailureCode(error) };
    }
};

/** Create dan update memakai bentuk payload dan pembacaan respons yang sama. */
const saveMaterial = async (
    send: () => Promise<{ data: unknown }>,
): Promise<SaveMaterialOutcome> => {
    if (navigator.onLine === false) {
        return { ok: false, code: 'offline' };
    }

    try {
        const { data: body } = await send();
        const envelope = readEnvelope(body);

        if (envelope.ok === false) {
            return envelope.message === null
                ? { ok: false, code: 'unknown' }
                : { ok: false, code: 'validation', message: envelope.message };
        }

        const saved = isRecord(envelope.data) ? envelope.data : {};

        return { ok: true, id: typeof saved.id === 'string' ? saved.id : null };
    } catch (error) {
        return { ok: false, code: toApiFailureCode(error) };
    }
};

export const createMaterial = (draft: MaterialDraft): Promise<SaveMaterialOutcome> =>
    saveMaterial(() => apiPostMultipart<unknown>(CREATE_PATH, buildFormData(draft)));

export const updateMaterial = (id: string, draft: MaterialDraft): Promise<SaveMaterialOutcome> =>
    saveMaterial(() => apiPutMultipart<unknown>(updatePath(id), buildFormData(draft)));

export const deleteMaterial = async (id: string): Promise<DeleteMaterialOutcome> => {
    if (navigator.onLine === false) {
        return { ok: false, code: 'offline' };
    }

    try {
        const { data: body } = await apiDelete<unknown>(deletePath(id));
        const envelope = readEnvelope(body);

        if (envelope.ok === false) {
            return envelope.message === null
                ? { ok: false, code: 'unknown' }
                : { ok: false, code: 'validation', message: envelope.message };
        }

        return { ok: true };
    } catch (error) {
        return { ok: false, code: toApiFailureCode(error) };
    }
};
