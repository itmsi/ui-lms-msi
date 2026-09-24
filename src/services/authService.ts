import { readEnvelope } from '@/helpers/apiEnvelope';
import { apiLoginPost } from '@/helpers/apiHelper';
import { isRecord, toMenuItems, toSsoUser, toStringList } from '@/helpers/authParsers';
import { clearStoredSession, readCachedSession, writeCachedSession } from '@/helpers/authSession';
import { getAuthToken, setAuthToken } from '@/helpers/authToken';
import { isTokenExpired } from '@/helpers/jwt';
import type { ApiMenuItem, ApiSsoUser, AuthErrorCode, AuthResult, Credentials } from '@/types/auth';
import type { AuthUser, CandidateProgram } from '@/types/user';

const LOGIN_PATH = 'auth/sso/login';

/**
 * `group_name` menentukan program belajar, bukan peran sistem: nilainya hanya
 * MT atau regular, sehingga tidak bisa membedakan kandidat dari Admin HR.
 * Yang menentukan menu dan akses adalah `menu` dari backend.
 */
const PROGRAM_BY_GROUP: Record<string, CandidateProgram> = {
    mt: 'mt',
    regular: 'regular',
};

const toProgram = (groupName: string | null): CandidateProgram | null =>
    groupName === null ? null : (PROGRAM_BY_GROUP[groupName.trim().toLowerCase()] ?? null);

const toAuthUser = (user: ApiSsoUser, menu: ApiMenuItem[], systems: string[]): AuthUser => ({
    id: user.id,
    // `employee_name` lebih resmi daripada `username`, tapi boleh kosong.
    name: user.employee_name ?? user.username,
    email: user.email,
    photoUrl: user.employee_foto,
    title: user.title_name,
    department: user.department_name,
    company: user.company_name,
    program: toProgram(user.group_name),
    menu: menu.map((item) => ({ name: item.name, permissions: item.permission })),
    systems,
});

/**
 * Gateway SSO menjawab kegagalan dengan badan kosong, jadi status HTTP adalah
 * satu-satunya petunjuk: 401 untuk kredensial salah, 400 untuk isian tidak lolos
 * validasi. Teks pesannya milik frontend karena server tidak mengirimkan apa pun.
 */
const toErrorCode = (error: unknown): AuthErrorCode => {
    const status = isRecord(error) && typeof error.status === 'number' ? error.status : null;

    if (status === 401) {
        return 'invalid_credentials';
    }

    if (status === 400) {
        return 'validation';
    }

    // Tidak ada status berarti tidak ada respons dari server.
    return status === null ? 'offline' : 'unknown';
};

export const signIn = async ({ email, password }: Credentials): Promise<AuthResult> => {
    if (navigator.onLine === false) {
        return { ok: false, code: 'offline' };
    }

    try {
        const { data: body } = await apiLoginPost<unknown>(LOGIN_PATH, { email, password });
        const envelope = readEnvelope(body);

        if (envelope.ok === false) {
            return envelope.message === null
                ? { ok: false, code: 'unknown' }
                : { ok: false, code: 'validation', message: envelope.message };
        }

        if (isRecord(envelope.data) === false) {
            return { ok: false, code: 'unknown' };
        }

        const payload = envelope.data;
        const oauth = isRecord(payload.oauth) ? payload.oauth : null;
        const token = oauth === null ? null : oauth.sso_token;
        const user = toSsoUser(payload.user);

        if (typeof token !== 'string' || user === null) {
            return { ok: false, code: 'unknown' };
        }

        const menu = toMenuItems(payload.menu);
        const systems = toStringList(payload.system);

        setAuthToken(token);
        writeCachedSession({ user, menu, systems });

        return { ok: true, user: toAuthUser(user, menu, systems) };
    } catch (error) {
        return { ok: false, code: toErrorCode(error) };
    }
};

/**
 * Sesi dipulihkan dari cache, bukan dari endpoint sesi: backend SSO belum punya
 * padanan `auth/me` yang terkonfirmasi, dan memanggil endpoint yang belum pasti ada
 * sama saja dengan menebak. Token yang sudah lewat masa berlakunya dibuang lebih dulu;
 * token yang kedaluwarsa di sisi server tetap ketahuan lewat 401 pada permintaan berikutnya.
 */
const readSession = (): AuthUser | null => {
    const token = getAuthToken();

    if (token === null || isTokenExpired(token)) {
        clearStoredSession();
        return null;
    }

    const cached = readCachedSession();

    if (cached === null) {
        clearStoredSession();
        return null;
    }

    return toAuthUser(cached.user, cached.menu, cached.systems);
};

/** Dipakai saat provider pertama kali dipasang, supaya tampilan tidak berkedip. */
export const readSessionFromCache = (): AuthUser | null => readSession();

export const restoreSession = (): Promise<AuthUser | null> => Promise.resolve(readSession());

/**
 * Belum ada endpoint logout yang terkonfirmasi, jadi sesi hanya dihapus di sisi klien.
 * Token SSO tetap berlaku di server sampai kedaluwarsa (expires_in = 86400 detik).
 */
export const signOut = () => {
    clearStoredSession();
};
