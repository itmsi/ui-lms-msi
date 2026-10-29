import { ArrowRight, CalendarClock, ClipboardCheck, FileClock, ListChecks, PencilLine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Card } from '@/components/ui/Card';
import { strings } from '@/locales/id';
import { resultPath } from '@/pages/Candidate/Quiz/hooks/useQuizSession';
import { countDraftAnswers, formatValidUntil, readDraft } from '@/pages/Candidate/Quiz/quizModel';
import type { ParticipantQuizSummary } from '@/types/quiz';
import { cn } from '@/utils/cn';

import '@/components/patterns/sticky-note.css';

const PILL_CLASS =
    'text-primary-dark text-caption inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-2 font-semibold shadow-sm transition-colors group-hover:bg-primary-light';

const RING_RADIUS = 17;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const MetricRing = ({ value }: { value: number | null }) => {
    const percentage = value === null ? 0 : Math.min(100, Math.max(0, value));

    return (
        <svg aria-hidden="true" viewBox="0 0 40 40" className="size-10 shrink-0 -rotate-90">
            <circle cx="20" cy="20" r={RING_RADIUS} fill="none" strokeWidth="4" className="stroke-white/15" />
            {value === null ? null : (
                <circle
                    cx="20"
                    cy="20"
                    r={RING_RADIUS}
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={RING_CIRCUMFERENCE * (1 - percentage / 100)}
                    className={cn('transition-[stroke-dashoffset] duration-500', percentage >= 100 ? 'stroke-success' : 'stroke-[#8ebde8]')}
                />
            )}
        </svg>
    );
};

const Metric = ({ label, value }: { label: string; value: number | null }) => (
    <div className="flex min-w-0 items-center gap-2.5">
        <MetricRing value={value} />
        <div className="flex min-w-0 flex-col">
            <span className="text-caption truncate text-white/70">{label}</span>
            <span className="text-body font-semibold text-white tabular-nums">{value === null ? '–' : `${String(Math.round(value))}%`}</span>
        </div>
    </div>
);

const BannerChip = ({ icon: Icon, label, light = false }: { icon: LucideIcon; label: string; light?: boolean }) => (
    <span
        className={cn(
            'text-caption inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-semibold backdrop-blur-sm',
            light ? 'text-primary-dark bg-white/90' : 'bg-[rgb(1_30_60/0.75)] text-white',
        )}
    >
        <Icon aria-hidden="true" className="size-3.5" />
        {label}
    </span>
);

interface QuizSummaryCardProps {
    quiz: ParticipantQuizSummary;
    userId: string;
}

export const QuizSummaryCard = ({ quiz, userId }: QuizSummaryCardProps) => {
    const [draftAnswered] = useState(() => {
        const draft = readDraft(userId, quiz.id);

        return draft === null ? null : countDraftAnswers(draft);
    });
    const [bannerFailed, setBannerFailed] = useState(false);

    const { lastAttempt, isCompleted } = quiz;
    const activeDraft = isCompleted ? null : draftAnswered;
    const showBanner = quiz.moduleBanner !== null && bannerFailed === false;
    const footerText = formatValidUntil(quiz.endDate);

    const scorePercent =
        lastAttempt === null || lastAttempt.maxScore === 0
            ? null
            : (lastAttempt.score / lastAttempt.maxScore) * 100;
    const progressPercent = isCompleted
        ? 100
        : activeDraft !== null && quiz.questionCount > 0
            ? (activeDraft / quiz.questionCount) * 100
            : 0;

    const actionLabel = isCompleted ? strings.myQuiz.viewScore : activeDraft === null ? strings.myQuiz.start : strings.myQuiz.resume;
    const target = isCompleted && lastAttempt !== null ? resultPath(quiz.id, lastAttempt.id) : `/my-quizzes/${quiz.id}`;
    const statusChip = isCompleted
        ? { icon: ClipboardCheck, label: strings.myQuiz.lastSubmitted }
        : activeDraft === null
            ? null
            : { icon: PencilLine, label: strings.myQuiz.inProgress };

    return (
        <article className="sticky-note group h-full">
            <Card className="bg-gradiend flex h-full flex-col overflow-hidden border-0 p-1 shadow-none">
                <div className="bg-primary-light relative aspect-2/1 w-full overflow-hidden rounded-[3px]">
                    {showBanner ? (
                        <img src={quiz.moduleBanner ?? ''} alt="" loading="lazy" onError={() => setBannerFailed(true)} className="size-full object-cover" />
                    ) : (
                        <div className="text-primary/30 flex size-full items-center justify-center">
                            <ClipboardCheck aria-hidden="true" className="size-14" strokeWidth={1.5} />
                            <span className="sr-only">{strings.myQuiz.noBanner}</span>
                        </div>
                    )}

                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                        <BannerChip icon={ListChecks} label={`${String(quiz.questionCount)} ${strings.myQuiz.questionsSuffix}`} />
                        {statusChip === null ? null : <BannerChip icon={statusChip.icon} label={statusChip.label} light />}
                    </div>
                </div>

                <div className="flex flex-1 flex-col gap-4 p-4">
                    <h3 className="text-card line-clamp-2 font-sans text-white">
                        <Link
                            to={target}
                            aria-label={`${actionLabel}: ${quiz.title}`}
                            className="after:absolute after:inset-0 after:rounded-sm focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-offset-3 focus-visible:after:outline-[#8ebde8]"
                        >
                            {quiz.title}
                        </Link>
                    </h3>

                    <div className="grid grid-cols-2 divide-x divide-white/15">
                        <Metric label={strings.myQuiz.scoreLabel} value={scorePercent} />
                        <div className="pl-4">
                            <Metric label={strings.myQuiz.progressMetric} value={progressPercent} />
                        </div>
                    </div>

                    {/* <div className="flex flex-wrap gap-2">
                        <span className="text-caption inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-white/90">
                            <BookOpen aria-hidden="true" className="size-3.5 shrink-0" />
                            <span className="truncate">{quiz.moduleTitle}</span>
                        </span>
                        {timeLeft === null ? null : (
                            <span
                                className={cn(
                                    'text-caption inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium',
                                    timeLeft.urgent ? 'bg-warning-soft text-warning-ink border-warning/50' : 'border-white/15 bg-white/10 text-white/90',
                                )}
                            >
                                <CalendarClock aria-hidden="true" className="size-3.5" />
                                {timeLeft.label}
                            </span>
                        )}
                    </div> */}

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/15 pt-3">
                        <p className="text-caption flex min-w-0 items-center gap-1.5 text-white/70">
                            <CalendarClock aria-hidden="true" className="size-3.5 shrink-0" />
                            <span className="truncate">{footerText}</span>
                        </p>
                        <span aria-hidden="true" className={PILL_CLASS}>
                            {isCompleted ? <FileClock className="size-3.5" /> : null}
                            {actionLabel}
                            {isCompleted ? null : <ArrowRight className="size-3.5" />}
                        </span>
                    </div>
                </div>
            </Card>
        </article>
    );
};
