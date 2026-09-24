/**
 * Bentuk Module setelah dipetakan dari respons API.
 *
 * Dipakai bersama oleh Perpustakaan (Candidate) dan Materi (Instructor): keduanya
 * membaca endpoint yang sama, jadi bentuk dan parsingnya tinggal di satu tempat
 * supaya tidak berkembang ke arah berbeda.
 */
export interface LearningModule {
    id: string;
    title: string;
    description: string | null;
    banner: string | null;
    linkMaterials: string[];
    category: string | null;
}

export interface ModulePagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ModuleListResult {
    items: LearningModule[];
    pagination: ModulePagination;
}

export type ModuleSort = 'latest' | 'title';

export interface ModuleListQuery {
    page: number;
    limit: number;
    search: string;
    sort: ModuleSort;
    /** null berarti `module_category` tidak dikirim sama sekali — parameternya opsional. */
    category: string | null;
    /** Membatasi hasil ke modul buatan pengguna ini. null berarti tidak dibatasi. */
    createdBy: string | null;
}

export type ApiFailureCode = 'validation' | 'unauthorized' | 'offline' | 'unknown';

export type ModuleListOutcome =
    | { ok: true; data: ModuleListResult }
    | { ok: false; code: ApiFailureCode; message?: string };

/* --- Detail Module, dipetakan dari GET modules/get/:id --- */

export interface ModuleChapter {
    id: string;
    title: string;
    /** HTML dari editor. Wajib dirender lewat `RichText`, tidak pernah langsung. */
    description: string;
    linkMaterials: string[];
    /** Nomor urut dari backend; dipakai mengurutkan, bukan posisi di array. */
    line: number;
}

export interface ModuleDetail {
    id: string;
    title: string;
    /** HTML dari editor. Wajib dirender lewat `RichText`. */
    description: string;
    banner: string | null;
    linkMaterials: string[];
    category: string | null;
    chapters: ModuleChapter[];
}

export type ModuleDetailOutcome =
    | { ok: true; data: ModuleDetail }
    | { ok: false; code: ApiFailureCode | 'not_found'; message?: string };
