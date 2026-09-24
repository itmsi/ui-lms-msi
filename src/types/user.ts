import type { MenuPermission } from './common';

/**
 * Program belajar kandidat, diturunkan dari `group_name`.
 * MT membuka Track 2 (termasuk Capstone); regular membuka Track 3 (Fungsional).
 */
export type CandidateProgram = 'mt' | 'regular';

export interface UserMenuItem {
    /** Nama dari backend. Sekaligus kunci pemetaan ke rute — lihat `layout/navigation.ts`. */
    name: string;
    permissions: MenuPermission[];
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    photoUrl: string | null;
    title: string | null;
    /**
     * Nama department apa adanya dari SSO (mis. "IT"). BUKAN kode department produk
     * (ITI/MSI/MSO/IEL/IEC) — jangan disambungkan ke DepartmentBadge tanpa pemetaan
     * yang dikonfirmasi.
     */
    department: string | null;
    company: string | null;
    /** null bila nilai `group_name` tidak dikenali. */
    program: CandidateProgram | null;
    /** Menentukan menu yang tampil sekaligus rute yang boleh dibuka. */
    menu: UserMenuItem[];
    /** Sistem yang boleh diakses akun ini, mis. ["LMS"]. */
    systems: string[];
}
