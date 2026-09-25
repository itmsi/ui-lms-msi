import type { MenuPermission } from './common';
import type { AuthUser } from './user';

export interface Credentials {
    email: string;
    password: string;
}

export type AuthErrorCode = 'invalid_credentials' | 'validation' | 'offline' | 'unknown';

export type AuthResult = { ok: true; user: AuthUser } | { ok: false; code: AuthErrorCode; message?: string };

export interface ApiSsoUser {
    id: string;
    username: string;
    email: string;
    employee_name: string | null;
    employee_foto: string | null;
    title_name: string | null;
    group_name: string | null;
    department_name: string | null;
    company_name: string | null;
}

export interface ApiMenuItem {
    name: string;
    url: string;
    permission: MenuPermission[];
}

export interface ApiOauth {
    sso_token: string;
    expires_in: number;
}

export interface LoginData {
    user: ApiSsoUser;
    menu: ApiMenuItem[];
    system: string[];
    oauth: ApiOauth;
}
