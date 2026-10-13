import { ArrowRight } from 'lucide-react';

import { ActivityKindIcon } from '@/components/patterns/ActivityKindIcon';
import { LinkButton } from '@/components/ui/LinkButton';
import { strings } from '@/locales/id';
import type { ActivityLog } from '@/types/activity';
import { toActivityDisplay, toActivityKind, toModuleTitle } from '@/utils/activityText';
import { formatFullDateTime, formatRelativeTime } from '@/utils/dateTime';

import '@/components/patterns/sticky-note.css';

interface ResumeCardProps {
    item: ActivityLog & { moduleId: string };
    now: number;
}

export const ResumeCard = ({ item, now }: ResumeCardProps) => {
    const title = item.moduleTitle ?? toModuleTitle(item.activity);
    const display = toActivityDisplay(item.activity);

    return (
        <div className="sticky-note motion-rise">
            <div className="bg-gradiend flex flex-col gap-4 p-5 pt-6 text-white sm:flex-row sm:items-center">
                <ActivityKindIcon kind={toActivityKind(item)} className="size-12 bg-white/15 text-white ring-2 ring-white/30" />

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-caption font-medium tracking-wide text-white/80 uppercase">{strings.activityLog.resumeEyebrow}</p>
                    <p className="font-display text-section line-clamp-2 text-white">{title ?? display}</p>
                    {title === null ? null : <p className="text-body line-clamp-1 text-white/85">{display}</p>}
                    <time dateTime={item.createdAt} title={formatFullDateTime(item.createdAt)} className="text-caption text-white/75">
                        {formatRelativeTime(item.createdAt, now)}
                    </time>
                </div>

                <LinkButton
                    to={`/library/${item.moduleId}`}
                    variant="secondary"
                    trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}
                    className="shrink-0 self-start sm:self-center"
                >
                    {strings.activityLog.resumeAction}
                </LinkButton>
            </div>
        </div>
    );
};
