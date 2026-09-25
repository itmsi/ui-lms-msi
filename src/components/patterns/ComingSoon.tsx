import { Construction } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LinkButton } from '@/components/ui/LinkButton';
import { strings } from '@/locales/id';

export const ComingSoon = () => (
    <section className="flex flex-col gap-6">
        <Card>
            <EmptyState
                icon={Construction}
                title={strings.states.comingSoonTitle}
                description={strings.states.comingSoonBody}
                action={
                    <LinkButton to="/dashboard" variant="secondary" size="sm">
                        {strings.common.backToDashboard}
                    </LinkButton>
                }
            />
        </Card>
    </section>
);
