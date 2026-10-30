import { CircleCheck, CircleSlash, FilePen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import type { BadgeTone } from '@/components/ui/Badge';
import { strings } from '@/locales/id';
import type { QuizSchedule } from '@/pages/QuizMaterials/types';

const SCHEDULE_STYLE: Record<QuizSchedule, { icon: LucideIcon; tone: BadgeTone }> = {
    draft: { icon: FilePen, tone: 'neutral' },
    active: { icon: CircleCheck, tone: 'success' },
    ended: { icon: CircleSlash, tone: 'neutral' },
};

export const QuizScheduleBadge = ({ schedule }: { schedule: QuizSchedule }) => (
    <Badge tone={SCHEDULE_STYLE[schedule].tone} icon={SCHEDULE_STYLE[schedule].icon}>
        {strings.quizForm.schedule[schedule]}
    </Badge>
);
