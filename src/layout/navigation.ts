import { BookOpen, LayoutDashboard, LibraryBig } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { strings } from '@/locales/id';
import type { UserMenuItem } from '@/types/user';

export interface NavItem {
    to: string;
    label: string;
    icon: LucideIcon;
}

const NAV_BY_MENU_NAME: Record<string, NavItem> = {
    'dashboard lms': { to: '/dashboard', label: strings.nav.dashboard, icon: LayoutDashboard },
    'materi lms': { to: '/materials', label: strings.nav.materials, icon: BookOpen },
    'perpustakaan lms': { to: '/library', label: strings.nav.library, icon: LibraryBig },
};

const ALWAYS_ALLOWED_ROUTES = ['/profile', '/history', '/403'];

const normalizeName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ');

const isUnder = (pathname: string, route: string) => pathname === route || pathname.startsWith(`${route}/`);

export const getNavItems = (menu: UserMenuItem[]): NavItem[] =>
    menu
        .map((item) => NAV_BY_MENU_NAME[normalizeName(item.name)])
        .filter((item): item is NavItem => item !== undefined);

export const canOpenRoute = (menu: UserMenuItem[], pathname: string): boolean =>
    ALWAYS_ALLOWED_ROUTES.some((route) => isUnder(pathname, route)) ||
    getNavItems(menu).some((item) => isUnder(pathname, item.to));

export const getPageLabel = (menu: UserMenuItem[], pathname: string): string =>
    getNavItems(menu).find((item) => isUnder(pathname, item.to))?.label ?? strings.app.name;

export const getLandingRoute = (menu: UserMenuItem[]): string | null => getNavItems(menu)[0]?.to ?? null;
