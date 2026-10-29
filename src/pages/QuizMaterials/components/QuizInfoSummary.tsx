import { BookOpen, CalendarRange, CircleCheck, CircleSlash, FilePen, Pencil, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { strings } from '@/locales/id';
import type { QuizInfo, QuizSchedule } from '@/pages/QuizMaterials/types';
import type { DateRange } from '@/types/dateRange';
import { cn } from '@/utils/cn';
import { formatIsoRange } from '@/utils/dateRangeText';
import { formatShortDate, fromIsoDate } from '@/utils/dateTime';

const SCHEDULE_STYLE: Record<QuizSchedule, { icon: LucideIcon; className: string }> = {
    draft: { icon: FilePen, className: 'bg-neutral-soft text-neutral-ink' },
    active: { icon: CircleCheck, className: 'bg-success-soft text-success-ink' },
    ended: { icon: CircleSlash, className: 'bg-neutral-soft text-neutral-ink' },
};

const resolveSchedule = (period: DateRange, today: string): QuizSchedule => {
    if (period.start > today) {
        return 'draft';
    }

    return period.end < today ? 'ended' : 'active';
};

const formatIso = (isoDate: string): string => {
    const date = fromIsoDate(isoDate);

    return date === undefined ? '' : formatShortDate(date);
};

const describeSchedule = (schedule: QuizSchedule, period: DateRange): string => {
    if (schedule === 'draft') {
        return `${strings.quizForm.scheduleDraftHint} ${formatIso(period.start)}.`;
    }

    if (schedule === 'active') {
        return `${strings.quizForm.scheduleActiveHint} ${formatIso(period.end)}.`;
    }

    return `${strings.quizForm.scheduleEndedHint}`;
};

const ScheduleNote = ({ period, today }: { period: DateRange; today: string }) => {
    const schedule = resolveSchedule(period, today);
    const { icon: Icon, className } = SCHEDULE_STYLE[schedule];

    return (
        <p className="border-line text-caption text-muted flex flex-wrap items-center gap-2 border-t pt-4">
            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium', className)}>
                <Icon aria-hidden="true" className="size-3.5 shrink-0" />
                {strings.quizForm.schedule[schedule]}
            </span>
            {describeSchedule(schedule, period)}
        </p>
    );
};

const SummaryItem = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
    <div className="flex min-w-0 items-start gap-2.5">
        <span aria-hidden="true" className="bg-primary-light text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Icon className="size-4" />
        </span>
        <span className="flex min-w-0 flex-col">
            <span className="text-caption text-muted">{label}</span>
            <span className="text-body text-ink truncate font-medium">{value}</span>
        </span>
    </div>
);

interface QuizInfoSummaryProps {
    info: QuizInfo;
    today: string;
    onEdit: () => void;
}

export const QuizInfoSummary = ({ info, today, onEdit }: QuizInfoSummaryProps) => (
    <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-caption text-muted">{strings.quizForm.titleLabel}</span>
                <h2 className="text-section line-clamp-2">{info.title}</h2>
            </div>
            <Button variant="secondary" size="sm" onClick={onEdit} leadingIcon={<Pencil aria-hidden="true" className="size-4" />}>
                {strings.quizForm.editInfo}
            </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
            <SummaryItem icon={BookOpen} label={strings.quizForm.moduleLabel} value={info.module?.title ?? '—'} />
            <SummaryItem
                icon={Users}
                label={strings.quizForm.audienceLabel}
                value={
                    (info.audiences as (keyof typeof strings.quizForm.audience)[]).length === 0
                        ? '—'
                        : (info.audiences as (keyof typeof strings.quizForm.audience)[])
                            .map((audience) => strings.quizForm.audience[audience])
                            .join(', ')
                }
            />
            <SummaryItem
                icon={CalendarRange}
                label={strings.quizForm.periodLabel}
                value={info.period === null ? '—' : formatIsoRange(info.period)}
            />
        </div>

        {info.period === null ? null : <ScheduleNote period={info.period} today={today} />}
    </Card>
);
