import { NavLink } from 'react-router-dom';

import { BrandPanelDecor } from '@/components/ui/BrandPanelDecor';
import type { NavItem } from '@/layout/navigation';
import { strings } from '@/locales/id';
import { cn } from '@/utils/cn';

interface AppSidebarProps {
    items: NavItem[];
}

export const AppSidebar = ({ items }: AppSidebarProps) => (
    <aside className="brand-panel hidden w-70 shrink-0 flex-col lg:flex">
        <BrandPanelDecor />

        <div className="relative z-10 flex h-16 shrink-0 items-center gap-2.5 border-b border-white/10 px-5">
            <span className="flex size-9 items-center justify-center">
                <img src="/msi_logo_white.svg" alt="Motorsights" />
            </span>
            <span className="login-serif text-card font-display text-white">{strings.app.name}</span>
        </div>

        <nav
            aria-label={strings.nav.mainMenu}
            className="relative z-10 flex flex-1 flex-col gap-1 overflow-y-auto p-3"
        >
            {items.map(({ to, label, icon: Icon }) => (
                <NavLink
                    key={to}
                    to={to}
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
                    <Icon aria-hidden="true" className="size-4.5 shrink-0" />
                    {label}
                </NavLink>
            ))}
        </nav>
    </aside>
);
