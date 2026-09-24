import { useAuth } from '@/hooks/useAuth';
import { useModuleList } from '@/hooks/useModuleList';
import type { ModuleListState } from '@/hooks/useModuleList';

export type MaterialsState = ModuleListState;

/** Daftar padat, bukan katalog bergambar besar — 10 baris cukup untuk satu layar. */
const PAGE_SIZE = 10;

/**
 * Materi hanya menampilkan modul buatan pengguna yang sedang masuk, lewat `created_by`.
 * Halaman ini selalu berada di balik ProtectedRoute, jadi `user` tidak pernah null
 * saat hook ini berjalan — percabangan null hanya penjaga tipe.
 */
export const useMaterials = () => {
    const { user } = useAuth();

    return useModuleList({ createdBy: user?.id ?? null, pageSize: PAGE_SIZE });
};
