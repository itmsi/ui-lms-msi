import { CircleCheck, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { strings } from '@/locales/id';
import type { QuizResultStatus } from '@/types/quizResult';

const STATUS_STYLE = {
    completed: { icon: CircleCheck, tone: 'success' },
    not_completed: { icon: Clock, tone: 'neutral' },
} as const;

export const QuizResultStatusBadge = ({ status }: { status: QuizResultStatus }) => (
    <Badge tone={STATUS_STYLE[status].tone} icon={STATUS_STYLE[status].icon} className="whitespace-nowrap">
        {strings.quizResults.status[status]}
    </Badge>
);
