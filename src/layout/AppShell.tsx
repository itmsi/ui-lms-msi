import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { AppBottomTabs } from '@/layout/AppBottomTabs';
import { AppSidebar } from '@/layout/AppSidebar';
import { AppTopbar } from '@/layout/AppTopbar';
import { getNavItems } from '@/layout/navigation';
import { strings } from '@/locales/id';

export const AppShell = () => {
    const { user } = useAuth();
    const { pathname } = useLocation();
    const mainRef = useRef<HTMLElement>(null);

    const items = user === null ? [] : getNavItems(user.menu);

    useEffect(() => {
        mainRef.current?.focus();
    }, [pathname]);

    return (
        <div className="flex h-dvh overflow-hidden">
            <a
                href="#main"
                className="bg-surface text-ink focus:ring-primary sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:ring-2"
            >
                {strings.nav.skipToContent}
            </a>

            <AppSidebar items={items} />

            <div className="flex min-w-0 flex-1 flex-col">
                <AppTopbar />
                <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 overflow-y-auto outline-none">
                    <div className="mx-auto w-full px-4 pt-6 pb-24 lg:px-8 lg:pb-12">
                        <Outlet />
                    </div>
                </main>
            </div>

            <AppBottomTabs items={items} />
        </div>
    );
};
