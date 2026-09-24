import { useModuleList } from '@/hooks/useModuleList';
import type { ModuleListState } from '@/hooks/useModuleList';

export type LibraryState = ModuleListState;

/**
 * Dipilih 12 karena habis dibagi 2 dan 3 — baris terakhir selalu penuh di semua
 * lebar grid. Ukuran halaman sengaja tidak mengikuti tinggi viewport: nilainya ikut
 * tersimpan di URL, dan mengubahnya saat jendela diubah ukurannya akan memicu
 * pengambilan ulang serta membuat tautan yang dibagikan tidak konsisten.
 */
const PAGE_SIZE = 12;

/** Perpustakaan menampilkan materi lintas-scope, jadi tidak dibatasi pembuatnya. */
export const useLibrary = () => useModuleList({ createdBy: null, pageSize: PAGE_SIZE });
