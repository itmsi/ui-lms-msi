import { useAuth } from '@/hooks/useAuth';
import { useModuleList } from '@/hooks/useModuleList';
import type { ModuleListState } from '@/hooks/useModuleList';
import type { CandidateProgram } from '@/types/user';

export type LibraryState = ModuleListState;

/**
 * Dipilih 12 karena habis dibagi 2 dan 3 — baris terakhir selalu penuh di semua
 * lebar grid. Ukuran halaman sengaja tidak mengikuti tinggi viewport: nilainya ikut
 * tersimpan di URL, dan mengubahnya saat jendela diubah ukurannya akan memicu
 * pengambilan ulang serta membuat tautan yang dibagikan tidak konsisten.
 */
const PAGE_SIZE = 12;

/**
 * Program akun (`group_name` dari login SSO) → `module_category` di `modules/get`.
 * Ejaan backend untuk reguler adalah `reguler`; `regular` ditolak API.
 *
 * CONTRACT: `mt` sudah terbukti diterima filter ini. `reguler` diterima saat create,
 * tetapi sebagai filter daftar belum diverifikasi — bila ditolak, backend membalasnya
 * dengan envelope error dan layar menampilkan state error, bukan daftar kosong.
 */
const CATEGORY_BY_PROGRAM: Record<CandidateProgram, string> = {
    mt: 'mt',
    regular: 'reguler',
};

/**
 * Perpustakaan menampilkan materi lintas pembuat, dibatasi ke program akun.
 * Akun yang `group_name`-nya tidak dikenali tidak dibatasi kategorinya — lebih baik
 * menampilkan semua materi daripada menebak programnya.
 */
export const useLibrary = () => {
    const { user } = useAuth();
    const program = user?.program ?? null;

    return useModuleList({
        createdBy: null,
        pageSize: PAGE_SIZE,
        fixedCategory: program === null ? null : CATEGORY_BY_PROGRAM[program],
    });
};
