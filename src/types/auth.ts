import type { MenuPermission } from './common';
import type { AuthUser } from './user';

export interface Credentials {
    email: string;
    password: string;
}

export type AuthErrorCode = 'invalid_credentials' | 'validation' | 'offline' | 'unknown';

/**
 * Service mengembalikan hasil, bukan melempar error, supaya setiap pemanggil
 * dipaksa menangani kasus gagal secara eksplisit.
 * `message` hanya terisi untuk error validasi, yang teksnya datang dari server.
 */
export type AuthResult = { ok: true; user: AuthUser } | { ok: false; code: AuthErrorCode; message?: string };

/*
 * Kontrak SSO, mengikuti contoh respons 22 Sep 2026.
 *
 * Hanya field yang benar-benar dipakai yang dideklarasikan. Yang sengaja diabaikan:
 * seluruh field NetSuite (`classes_*_netsuite`, `employee_id_netsuite`,
 * `current_approver_netsuite_id`), `is_customer`, `role_assign_interview`, blok
 * `session`, serta `oauth.authorization_code` dan `oauth.redirect_uri` — tidak satu pun
 * dibutuhkan UI, dan mendeklarasikannya hanya menimbulkan kesan sudah dipakai.
 */

export interface ApiSsoUser {
    id: string;
    username: string;
    email: string;
    employee_name: string | null;
    employee_foto: string | null;
    title_name: string | null;
    /** "MT" atau "regular" — penentu program belajar, bukan peran sistem. */
    group_name: string | null;
    department_name: string | null;
    company_name: string | null;
}

export interface ApiMenuItem {
    name: string;
    /** Saat ini selalu kosong dari backend; rute dipetakan frontend dari `name`. */
    url: string;
    /** Verba yang tidak dikenali dibuang saat parsing, jadi tipe ini sudah dipersempit. */
    permission: MenuPermission[];
}

export interface ApiOauth {
    sso_token: string;
    expires_in: number;
}

/** Bentuk `data` pada POST auth/login. */
export interface LoginData {
    user: ApiSsoUser;
    menu: ApiMenuItem[];
    system: string[];
    oauth: ApiOauth;
}
