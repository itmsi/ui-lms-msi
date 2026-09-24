import { Bell, GraduationCap, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { EmptyState } from '@/components/ui/EmptyState';
import { Popover } from '@/components/ui/Popover';
import { useAuth } from '@/hooks/useAuth';
import { getPageLabel } from '@/layout/navigation';
import { strings } from '@/locales/id';
import { getInitials } from '@/utils/getInitials';

export const AppTopbar = () => {
    const { user, signOut } = useAuth();
    const { pathname } = useLocation();

    return (
        <header className="border-line bg-surface z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b px-4 lg:px-8">
            <div className="flex min-w-0 items-center gap-2.5">
                <span className="bg-primary flex size-8 items-center justify-center rounded-lg text-white lg:hidden">
                    <GraduationCap aria-hidden="true" className="size-4.5" />
                </span>
                <p className="text-card text-ink truncate">
                    <span className="lg:hidden">{strings.app.name}</span>
                    <span className="hidden lg:inline">{getPageLabel(user?.menu ?? [], pathname)}</span>
                </p>
            </div>

            <div className="flex items-center gap-1">
                <Popover
                    label={strings.nav.notifications}
                    triggerClassName="size-10"
                    panelClassName="w-80 max-w-[calc(100vw-2rem)]"
                    trigger={<Bell aria-hidden="true" className="size-5" />}
                >
                    {() => (
                        <div>
                            <p className="border-line text-card text-ink border-b px-4 py-3">
                                {strings.nav.notifications}
                            </p>
                            <EmptyState
                                icon={Bell}
                                title={strings.nav.notificationsEmptyTitle}
                                description={strings.nav.notificationsEmptyBody}
                                className="py-8"
                            />
                        </div>
                    )}
                </Popover>

                <Popover
                    label={strings.nav.accountMenu}
                    triggerClassName="size-10"
                    panelClassName="w-64"
                    trigger={
                        user?.photoUrl == null ? (
                            <span className="bg-primary-light text-primary-dark text-caption flex size-8 items-center justify-center rounded-full font-semibold">
                                {user === null ? '' : getInitials(user.name)}
                            </span>
                        ) : (
                            <img
                                src={user.photoUrl}
                                alt=""
                                className="bg-neutral-soft size-8 rounded-full object-cover"
                            />
                        )
                    }
                >
                    {() => (
                        <div className="p-1.5">
                            {user === null ? null : (
                                <div className="border-line border-b px-3 py-2.5">
                                    <p className="text-body text-ink font-medium">{user.name}</p>
                                    <p className="text-caption text-muted truncate">{user.email}</p>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={signOut}
                                className="text-body text-ink hover:bg-neutral-soft mt-1.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors"
                            >
                                <LogOut aria-hidden="true" className="size-4" />
                                {strings.common.logout}
                            </button>
                        </div>
                    )}
                </Popover>
            </div>
        </header>
    );
};
