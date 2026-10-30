import { BookOpen, Check, CircleCheck, Clock, Hourglass, Lock, RefreshCw, TriangleAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import type { BadgeTone } from '@/components/ui/Badge';
import { strings } from '@/locales/id';
import type { LearningStatus } from '@/types/common';

interface StatusBadgeProps {
    status: LearningStatus;
    className?: string;
}

const STATUS_STYLE: Record<LearningStatus, { icon: LucideIcon; tone: BadgeTone }> = {
    completed: { icon: Check, tone: 'success' },
    approved: { icon: CircleCheck, tone: 'success' },
    in_progress: { icon: BookOpen, tone: 'primary' },
    under_review: { icon: Hourglass, tone: 'primary' },
    not_started: { icon: Clock, tone: 'neutral' },
    locked: { icon: Lock, tone: 'neutral' },
    needs_revision: { icon: RefreshCw, tone: 'warning' },
    overdue: { icon: TriangleAlert, tone: 'danger' },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => (
    <Badge tone={STATUS_STYLE[status].tone} icon={STATUS_STYLE[status].icon} className={className}>
        {strings.status[status]}
    </Badge>
);
