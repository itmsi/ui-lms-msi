import { FolderOpen } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LinkButton } from '@/components/ui/LinkButton';
import { strings } from '@/locales/id';

export const NotFound = () => (
    <section className="flex flex-col gap-6">
        <h1 className="sr-only">{strings.errorPages.notFoundTitle}</h1>
        <Card>
            <EmptyState
                icon={FolderOpen}
                title={strings.errorPages.notFoundTitle}
                description={strings.errorPages.notFoundBody}
                action={
                    <LinkButton to="/dashboard" variant="secondary" size="sm">
                        {strings.common.backToDashboard}
                    </LinkButton>
                }
            />
        </Card>
    </section>
);

export default NotFound;
