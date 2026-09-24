import { readEnvelope } from '@/helpers/apiEnvelope';
import { apiGet, apiPost } from '@/helpers/apiHelper';
import { isRecord } from '@/helpers/authParsers';
import type {
    ApiFailureCode,
    LearningModule,
    ModuleChapter,
    ModuleDetail,
    ModuleDetailOutcome,
    ModuleListOutcome,
    ModuleListQuery,
    ModuleListResult,
    ModulePagination,
    ModuleSort,
} from '@/types/module';

/** Ruas path-nya memang bernama "get", dan methodnya POST. */
const MODULES_LIST_PATH = 'modules/get';

/**
 * CONTRACT: hanya `created_at` yang sudah terbukti diterima API. `title` belum
 * diverifikasi — bila ditolak, backend membalasnya sebagai envelope error dan layar
 * menampilkan state error, bukan diam-diam mengabaikan urutannya.
 */
const SORT_REQUEST: Record<ModuleSort, { sortBy: string; sortOrder: string }> = {
    latest: { sortBy: 'created_at', sortOrder: 'desc' },
    title: { sortBy: 'title', sortOrder: 'asc' },
};

const readString = (value: unknown): string | null => (typeof value === 'string' && value !== '' ? value : null);

const toLinkMaterials = (value: unknown): string[] =>
    Array.isArray(value) ? (value as unknown[]).filter((item): item is string => typeof item === 'string') : [];

const toLearningModule = (value: unknown): LearningModule | null => {
    if (isRecord(value) === false || typeof value.id !== 'string') {
        return null;
    }

    return {
        id: value.id,
        title: readString(value.title) ?? '',
        description: readString(value.description),
        banner: readString(value.banner),
        linkMaterials: toLinkMaterials(value.link_materials),
        category: readString(value.module_category),
    };
};

const toPagination = (value: unknown, fallback: ModuleListQuery): ModulePagination => {
    const source = isRecord(value) ? value : {};
    const readNumber = (candidate: unknown, byDefault: number) =>
        typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : byDefault;

    return {
        page: readNumber(source.page, fallback.page),
        limit: readNumber(source.limit, fallback.limit),
        total: readNumber(source.total, 0),
        totalPages: readNumber(source.totalPages, 0),
    };
};

export const toApiFailureCode = (error: unknown): ApiFailureCode => {
    const status = isRecord(error) && typeof error.status === 'number' ? error.status : null;

    if (status === 401 || status === 403) {
        return 'unauthorized';
    }

    // Tidak ada status berarti tidak ada respons dari server.
    return status === null ? 'offline' : 'unknown';
};

/**
 * `module_category` dan `created_by` hanya dikirim bila ada nilainya: keduanya
 * opsional, dan nilai yang tidak dikenali ditolak API lewat envelope error
 * berstatus 2xx — yang tanpa pemeriksaan badan akan terbaca sebagai daftar kosong.
 */
export const fetchModules = async (query: ModuleListQuery, signal?: AbortSignal): Promise<ModuleListOutcome> => {
    if (navigator.onLine === false) {
        return { ok: false, code: 'offline' };
    }

    try {
        const { data: body } = await apiPost<unknown>(
            MODULES_LIST_PATH,
            {
                page: query.page,
                limit: query.limit,
                sort_by: SORT_REQUEST[query.sort].sortBy,
                sort_order: SORT_REQUEST[query.sort].sortOrder,
                search: query.search,
                ...(query.category === null ? {} : { module_category: query.category }),
                ...(query.createdBy === null ? {} : { created_by: query.createdBy }),
            },
            { signal },
        );

        const envelope = readEnvelope(body);

        if (envelope.ok === false) {
            return envelope.message === null
                ? { ok: false, code: 'unknown' }
                : { ok: false, code: 'validation', message: envelope.message };
        }

        const payload = isRecord(envelope.data) ? envelope.data : {};
        const rawItems = Array.isArray(payload.items) ? (payload.items as unknown[]) : [];

        const result: ModuleListResult = {
            items: rawItems.map(toLearningModule).filter((item): item is LearningModule => item !== null),
            pagination: toPagination(payload.pagination, query),
        };

        return { ok: true, data: result };
    } catch (error) {
        return { ok: false, code: toApiFailureCode(error) };
    }
};

const detailPath = (id: string) => `modules/get/${encodeURIComponent(id)}`;

const toChapter = (value: unknown, fallbackLine: number): ModuleChapter | null => {
    if (isRecord(value) === false || typeof value.id !== 'string') {
        return null;
    }

    return {
        id: value.id,
        title: readString(value.title) ?? '',
        description: readString(value.description) ?? '',
        linkMaterials: toLinkMaterials(value.link_materials),
        line: typeof value.line === 'number' && Number.isFinite(value.line) ? value.line : fallbackLine,
    };
};

const toDetail = (value: unknown): ModuleDetail | null => {
    if (isRecord(value) === false || typeof value.id !== 'string') {
        return null;
    }

    const rawChapters = Array.isArray(value.chapters) ? (value.chapters as unknown[]) : [];

    return {
        id: value.id,
        title: readString(value.title) ?? '',
        description: readString(value.description) ?? '',
        banner: readString(value.banner),
        linkMaterials: toLinkMaterials(value.link_materials),
        category: readString(value.module_category),
        // Diurutkan dari `line`, bukan dari urutan array — urutan belajar milik backend.
        chapters: rawChapters
            .map((chapter, index) => toChapter(chapter, index + 1))
            .filter((chapter): chapter is ModuleChapter => chapter !== null)
            .sort((left, right) => left.line - right.line),
    };
};

/** Dipakai bersama oleh detail Perpustakaan, detail Materi, dan editor Materi. */
export const fetchModuleDetail = async (id: string, signal?: AbortSignal): Promise<ModuleDetailOutcome> => {
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
