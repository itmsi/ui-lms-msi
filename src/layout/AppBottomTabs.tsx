import { NavLink } from 'react-router-dom';

import { strings } from '@/locales/id';
import type { NavItem } from '@/layout/navigation';
import { cn } from '@/utils/cn';

interface AppBottomTabsProps {
    items: NavItem[];
}

export const AppBottomTabs = ({ items }: AppBottomTabsProps) => (
    <nav
        aria-label={strings.nav.mainMenu}
        className="border-line bg-surface fixed inset-x-0 bottom-0 z-10 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
        <ul className="flex">
            {items.map(({ to, label, icon: Icon }) => (
                <li key={to} className="flex-1">
                    <NavLink
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                'text-caption flex min-h-14 flex-col items-center justify-center gap-1 transition-colors',
                                isActive ? 'text-primary font-semibold' : 'text-muted',
                            )
                        }
                    >
                        <Icon aria-hidden="true" className="size-5" />
                        {label}
                    </NavLink>
                </li>
            ))}
        </ul>
    </nav>
);
