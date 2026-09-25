import type { MenuPermission } from '@/types/common';
import type { UserMenuItem } from '@/types/user';

const normalizeName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ');

export const MATERIALS_MENU_NAME = 'materi lms';

export interface MaterialsAccess {
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

export const readMaterialsAccess = (menu: UserMenuItem[]): MaterialsAccess => {
    const item = menu.find((entry) => normalizeName(entry.name) === MATERIALS_MENU_NAME);

    const allows = (permission: MenuPermission) => item?.permissions.includes(permission) === true;

    return {
        canView: item !== undefined,
        canCreate: allows('create'),
        canUpdate: allows('update'),
        canDelete: allows('delete'),
    };
};
