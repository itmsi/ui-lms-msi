import { Inbox } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { strings } from '@/locales/id';

export const NoMenuAccess = () => {
    const { user, signOut } = useAuth();

    return (
        <section className="flex flex-col gap-6">
            <h1 className="sr-only">{strings.noMenu.title}</h1>
            <Card>
                <EmptyState
                    icon={Inbox}
                    title={strings.noMenu.title}
                    description={strings.noMenu.body}
                    action={
                        <Button variant="secondary" size="sm" onClick={signOut}>
                            {strings.common.logout}
                        </Button>
                    }
                />
                {user === null ? null : (
                    <dl className="border-line text-body flex items-center justify-center gap-2 border-t px-6 py-4">
                        <dt className="text-muted">{strings.noMenu.accountLabel}</dt>
                        <dd className="text-ink font-medium">{user.email}</dd>
                    </dl>
                )}
            </Card>
        </section>
    );
};

export default NoMenuAccess;
