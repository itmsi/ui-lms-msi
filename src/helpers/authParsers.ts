import type { ApiMenuItem, ApiSsoUser } from '@/types/auth';
import { MENU_PERMISSIONS } from '@/types/common';
import type { MenuPermission } from '@/types/common';

export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const readOptionalString = (value: unknown): string | null => (typeof value === 'string' ? value : null);

export const toSsoUser = (value: unknown): ApiSsoUser | null => {
    if (
        isRecord(value) === false ||
        typeof value.id !== 'string' ||
        typeof value.username !== 'string' ||
        typeof value.email !== 'string'
    ) {
        return null;
    }

    return {
        id: value.id,
        username: value.username,
        email: value.email,
        employee_name: readOptionalString(value.employee_name),
        employee_foto: readOptionalString(value.employee_foto),
        title_name: readOptionalString(value.title_name),
        group_name: readOptionalString(value.group_name),
        department_name: readOptionalString(value.department_name),
        company_name: readOptionalString(value.company_name),
    };
};

const isMenuPermission = (value: unknown): value is MenuPermission =>
    typeof value === 'string' && MENU_PERMISSIONS.some((permission) => permission === value);

export const toMenuItems = (value: unknown): ApiMenuItem[] => {
    if (Array.isArray(value) === false) {
        return [];
    }

    return (value as unknown[])
        .filter((item): item is Record<string, unknown> => isRecord(item) && typeof item.name === 'string')
        .map((item) => ({
            name: String(item.name),
            url: typeof item.url === 'string' ? item.url : '',
            permission: Array.isArray(item.permission)
                ? (item.permission as unknown[]).filter(isMenuPermission)
                : [],
        }));
};

export const toStringList = (value: unknown): string[] =>
    Array.isArray(value) ? (value as unknown[]).filter((item): item is string => typeof item === 'string') : [];
