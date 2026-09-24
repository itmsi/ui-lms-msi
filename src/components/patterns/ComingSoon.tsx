import { Construction } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LinkButton } from '@/components/ui/LinkButton';
import { strings } from '@/locales/id';

interface ComingSoonProps {
    title: string;
}

/**
 * Penanda sementara untuk rute yang sudah ada di navigasi tetapi layarnya belum dibangun,
 * supaya navigasi tidak pernah berujung ke halaman kosong. Dihapus begitu layarnya jadi.
 */
export const ComingSoon = ({ title }: ComingSoonProps) => (
    <section className="flex flex-col gap-6">
        <h1 className="text-page">{title}</h1>
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
