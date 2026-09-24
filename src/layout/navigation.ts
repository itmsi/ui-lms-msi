import { BookOpen, LayoutDashboard, LibraryBig } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { strings } from '@/locales/id';
import type { UserMenuItem } from '@/types/user';

export interface NavItem {
    to: string;
    label: string;
    icon: LucideIcon;
}

/**
 * Backend mengirim `url` kosong untuk semua item menu, jadi rute dipetakan dari `name`.
 * Kelemahannya diterima sadar: mengganti nama menu di backend akan memutus navigasi di
 * sini tanpa peringatan apa pun. Nama dinormalkan lebih dulu supaya beda kapital atau
 * spasi ganda tidak ikut memutus.
 */
const NAV_BY_MENU_NAME: Record<string, NavItem> = {
    'dashboard lms': { to: '/dashboard', label: strings.nav.dashboard, icon: LayoutDashboard },
    'materi lms': { to: '/materials', label: strings.nav.materials, icon: BookOpen },
    'perpustakaan lms': { to: '/library', label: strings.nav.library, icon: LibraryBig },
};

/**
 * Rute yang tetap boleh dibuka meski tidak ada di menu backend. Profil dicapai dari
 * menu avatar di topbar, dan Riwayat adalah layar Candidate yang menu backend-nya
 * belum mencakup — keduanya soal akses, bukan tampil di navigasi.
 */
const ALWAYS_ALLOWED_ROUTES = ['/profile', '/history', '/403'];

const normalizeName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ');

const isUnder = (pathname: string, route: string) => pathname === route || pathname.startsWith(`${route}/`);

/** Urutan mengikuti urutan dari backend. Item yang belum punya pemetaan dilewati. */
export const getNavItems = (menu: UserMenuItem[]): NavItem[] =>
    menu
        .map((item) => NAV_BY_MENU_NAME[normalizeName(item.name)])
        .filter((item): item is NavItem => item !== undefined);

export const canOpenRoute = (menu: UserMenuItem[], pathname: string): boolean =>
    ALWAYS_ALLOWED_ROUTES.some((route) => isUnder(pathname, route)) ||
    getNavItems(menu).some((item) => isUnder(pathname, item.to));

export const getPageLabel = (menu: UserMenuItem[], pathname: string): string =>
    getNavItems(menu).find((item) => isUnder(pathname, item.to))?.label ?? strings.app.name;

/** Halaman pertama setelah masuk: item menu pertama yang dikenali. */
export const getLandingRoute = (menu: UserMenuItem[]): string | null => getNavItems(menu)[0]?.to ?? null;
