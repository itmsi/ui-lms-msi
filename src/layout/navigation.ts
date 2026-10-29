import { Activity, BookOpen, ClipboardCheck, ClipboardList, LayoutDashboard, LibraryBig, Users } from 'lucide-react';
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
    'user activity lms': { to: '/user-activity', label: strings.nav.userActivity, icon: Users },
    // 'materi quiz': { to: '/quizzes', label: strings.nav.quizMaterials, icon: ClipboardList },
};

const ALWAYS_NAV_ITEMS: NavItem[] = [
    { to: '/my-quizzes', label: strings.nav.myQuiz, icon: ClipboardCheck },
    { to: '/my-activity', label: strings.nav.myActivity, icon: Activity },
    { to: '/quizzes', label: strings.nav.quizMaterials, icon: ClipboardList },
];

const NAV_ORDER = ['/dashboard', '/library', '/my-quizzes', '/my-activity', '/user-activity', '/materials', '/quizzes'];

const orderOf = (item: NavItem): number => {
    const index = NAV_ORDER.indexOf(item.to);

    return index === -1 ? NAV_ORDER.length : index;
};

const sortNavItems = (items: NavItem[]): NavItem[] => [...items].sort((left, right) => orderOf(left) - orderOf(right));

const ALWAYS_ALLOWED_ROUTES = ['/profile', '/history', '/403'];

const NESTED_ROUTES: Record<string, string> = {
    '/tracks': '/dashboard',
};

const normalizeName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ');

const isUnder = (pathname: string, route: string) => pathname === route || pathname.startsWith(`${route}/`);

const getMenuNavItems = (menu: UserMenuItem[]): NavItem[] =>
    sortNavItems(menu.map((item) => NAV_BY_MENU_NAME[normalizeName(item.name)]).filter((item): item is NavItem => item !== undefined));

export const getNavItems = (menu: UserMenuItem[]): NavItem[] => sortNavItems([...getMenuNavItems(menu), ...ALWAYS_NAV_ITEMS]);

export const canOpenRoute = (menu: UserMenuItem[], pathname: string): boolean => {
    if (ALWAYS_ALLOWED_ROUTES.some((route) => isUnder(pathname, route))) {
        return true;
    }

    const navItems = getNavItems(menu);

    if (navItems.some((item) => isUnder(pathname, item.to))) {
        return true;
    }

    return Object.entries(NESTED_ROUTES).some(
        ([prefix, parentRoute]) => isUnder(pathname, prefix) && navItems.some((item) => item.to === parentRoute),
    );
};

export const getPageLabel = (menu: UserMenuItem[], pathname: string): string =>
    getNavItems(menu).find((item) => isUnder(pathname, item.to))?.label ?? strings.app.name;

export const getLandingRoute = (menu: UserMenuItem[]): string | null => getMenuNavItems(menu)[0]?.to ?? null;
