import type { QuizSchedule } from '@/pages/QuizMaterials/types';
import type { DateRange } from '@/types/dateRange';

export const resolveSchedule = (period: DateRange, today: string): QuizSchedule => {
    if (period.start > today) {
        return 'draft';
    }

    return period.end < today ? 'ended' : 'active';
};
