import type { MenuPermission } from '@/types/common';
import type { UserMenuItem } from '@/types/user';

const normalizeName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * Nama menu dari SSO yang menandai akses ke pengelolaan materi.
 * Penugasannya dilakukan HR di sisi SSO — aplikasi ini hanya membacanya.
 */
export const MATERIALS_MENU_NAME = 'materi lms';

export interface MaterialsAccess {
    /** Menu-nya ada: daftar materi boleh dibuka. */
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

/**
 * Kehadiran menu membuka areanya; verba di dalamnya menentukan apa yang boleh
 * dilakukan di sana. Akun yang hanya punya `read` tetap bisa melihat daftar materi —
 * menolaknya akan menyembunyikan informasi yang memang haknya.
 *
 * Ini hanya cerminan untuk pengalaman pengguna. Penegakan sesungguhnya ada di API:
 * menyembunyikan tombol tidak menghentikan siapa pun yang memanggil endpoint langsung.
 */
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
