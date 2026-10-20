import { NavLink } from 'react-router-dom';

import { BrandPanelDecor } from '@/components/ui/BrandPanelDecor';
import type { NavItem } from '@/layout/navigation';
import { strings } from '@/locales/id';
import { cn } from '@/utils/cn';
// import { CircleUser } from 'lucide-react';

interface AppSidebarProps {
    items: NavItem[];
    collapsed: boolean;
}

export const AppSidebar = ({ items, collapsed }: AppSidebarProps) => (
    <aside
        id="app-sidebar"
        className={cn(
            'brand-panel hidden shrink-0 flex-col overflow-hidden transition-[width] duration-200 lg:flex',
            collapsed ? 'w-18' : 'w-70',
        )}
    >
        <BrandPanelDecor />

        <div
            className={cn(
                'relative z-10 flex h-16 shrink-0 items-center gap-2.5 border-b border-white/10',
                collapsed ? 'justify-center px-0' : 'px-5',
            )}
        >
            <span className="flex size-9 shrink-0 items-center justify-center">
                {/* <img src="/msi_logo_white.svg" alt="Motorsights" /> */}
                <img src="/msi-logo-transparent.png" alt="Motorsights" />
                {/* <img src="/mi_logo.svg" alt="Motorsights" /> */}
                {/* <img src="/mi_logo_white.svg" alt="Motorsights" /> */}
            </span>
            {collapsed ? null : (
                <span className="login-serif text-card font-display whitespace-nowrap text-white">{strings.app.name}</span>
            )}
        </div>

        <nav
            aria-label={strings.nav.mainMenu}
            className="relative z-10 flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto p-3"
        >
            {items.map(({ to, label, icon: Icon }) => (
                <NavLink
                    key={to}
                    to={to}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) =>
                        cn(
                            'text-body font-serif flex items-center gap-3 rounded-lg py-2.5 whitespace-nowrap transition-colors',
                            'focus-visible:outline-white',
                            collapsed ? 'justify-center px-0' : 'px-3',
                            isActive
                                ? 'bg-white/15 text-white'
                                : 'text-sidebar-muted hover:bg-white/5 hover:text-white',
                        )
                    }
                >
                    <Icon aria-hidden="true" className="size-4.5 shrink-0" />
                    <span className={cn(collapsed && 'sr-only')}>{label}</span>
                </NavLink>
            ))}
            {/* <NavLink
                to={'/profile'}
                className={({ isActive }) =>
                    cn(
                        'text-body font-serif flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                        'focus-visible:outline-white',
                        isActive
                            ? 'bg-white/15 text-white'
                            : 'text-sidebar-muted hover:bg-white/5 hover:text-white',
                    )
                }
            >
                <CircleUser className="size-4.5 shrink-0" />
                Profile
            </NavLink> */}
        </nav>
    </aside>
);
