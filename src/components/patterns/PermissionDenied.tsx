import { ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { strings } from '@/locales/id';

interface PermissionDeniedProps {
    title?: string;
    /** Jelaskan siapa yang bisa memberi izinnya, bukan hanya bahwa aksesnya ditolak. */
    description: string;
    action?: ReactNode;
}

export const PermissionDenied = ({ title = strings.permission.title, description, action }: PermissionDeniedProps) => (
    <Card>
        <EmptyState icon={ShieldAlert} title={title} description={description} action={action} />
    </Card>
);
