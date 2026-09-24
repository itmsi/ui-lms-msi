import type {
    ApiFailureCode,
    LearningModule,
    ModuleListOutcome,
    ModuleListResult,
    ModulePagination,
    ModuleSort,
} from '@/types/module';

/**
 * Perpustakaan memakai bentuk Module yang sama dengan Materi (Instructor) — keduanya
 * membaca endpoint yang sama. Nama-nama di bawah dipertahankan sebagai alias supaya
 * komponen layar ini tidak perlu ikut berubah saat parsingnya dipindah ke satu tempat.
 */
export type LibraryModule = LearningModule;
export type LibraryPagination = ModulePagination;
export type LibraryListResult = ModuleListResult;
export type LibrarySort = ModuleSort;
export type LibraryErrorCode = ApiFailureCode;
export type LibraryListOutcome = ModuleListOutcome;
