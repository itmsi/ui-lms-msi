import type { MenuPermission } from '@/types/common';
import type { UserMenuItem } from '@/types/user';

const normalizeName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ');

export const PERMISSION_MENUS = {
    materials: 'materi lms',
    quizMaterials: 'materi quiz lms',
} as const;

export type PermissionMenu = keyof typeof PERMISSION_MENUS;

export interface MenuAccess {
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

export const readMenuAccess = (menu: UserMenuItem[], key: PermissionMenu): MenuAccess => {
    const item = menu.find((entry) => normalizeName(entry.name) === PERMISSION_MENUS[key]);

    const allows = (permission: MenuPermission) => item?.permissions.includes(permission) === true;

    return {
        canView: item !== undefined,
        canCreate: allows('create'),
        canUpdate: allows('update'),
        canDelete: allows('delete'),
    };
};
