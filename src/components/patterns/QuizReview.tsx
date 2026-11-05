import { CircleCheck, CircleDashed, CircleDot, FileImage, FileText, Hourglass } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/Badge';
import { BADGE_TONE_CLASS } from '@/components/ui/badgeTone';
import type { BadgeTone } from '@/components/ui/badgeTone';
import { RichText } from '@/components/ui/RichText';
import { strings } from '@/locales/id';
import type { QuestionReview, SubmittedAttachment } from '@/types/quiz';
import { formatFileSize, isImageName } from '@/utils/attachmentUpload';
import { cn } from '@/utils/cn';

export type ReviewStatus = 'correct' | 'incorrect' | 'pending' | 'unanswered';

const STATUS_STYLE: Record<ReviewStatus, { icon: LucideIcon; label: string; tone: BadgeTone }> = {
    correct: { icon: CircleCheck, label: strings.myQuiz.reviewCorrect, tone: 'success' },
    incorrect: { icon: CircleDot, label: strings.myQuiz.reviewIncorrect, tone: 'warning' },
    pending: { icon: Hourglass, label: strings.myQuiz.reviewPending, tone: 'primary' },
    unanswered: { icon: CircleDashed, label: strings.myQuiz.noAnswer, tone: 'neutral' },
};

type SubmittedAnswer = Pick<QuestionReview, 'type' | 'yourAnswer' | 'yourAttachments'>;

export const ReviewStatusBadge = ({ status }: { status: ReviewStatus }) => (
    <Badge tone={STATUS_STYLE[status].tone} icon={STATUS_STYLE[status].icon}>
        {STATUS_STYLE[status].label}
    </Badge>
);

interface ReviewLineProps {
    label: string;
    status?: ReviewStatus;
    className: string;
    children: ReactNode;
}

const ReviewLine = ({ label, status, className, children }: ReviewLineProps) => {
    const style = status === undefined ? null : STATUS_STYLE[status];

    return (
        <div className={cn('flex min-w-0 flex-col', className, style !== null && `rounded-lg p-3 ${BADGE_TONE_CLASS[style.tone]}`)}>
            <dt className={cn('text-caption flex items-center gap-1.5', style === null ? 'text-muted' : 'font-medium')}>
                {style === null ? null : <style.icon aria-hidden="true" className="size-3.5 shrink-0" />}
                {label}
            </dt>
            {children}
        </div>
    );
};

interface AnswerLineProps {
    label: string;
    values: string[];
    rich?: boolean;
    status?: ReviewStatus;
}

export const AnswerLine = ({ label, values, rich = false, status }: AnswerLineProps) => (
    <ReviewLine label={label} status={status} className="gap-0.5">
        <dd className="text-body text-ink min-w-0">
            {values.length === 0 ? strings.myQuiz.noAnswer : rich ? <RichText html={values.join('')} /> : values.join(', ')}
        </dd>
    </ReviewLine>
);

interface AttachmentLineProps {
    label: string;
    files: SubmittedAttachment[];
    status?: ReviewStatus;
}

export const AttachmentLine = ({ label, files, status }: AttachmentLineProps) => (
    <ReviewLine label={label} status={status} className="gap-1">
        <dd className="min-w-0">
            <ul className="flex flex-col gap-1.5">
                {files.map((file, index) => {
                    const Icon = isImageName(file.name) ? FileImage : FileText;

                    return (
                        <li key={`${file.name}-${String(index)}`} className="flex min-w-0 items-center gap-2">
                            <Icon aria-hidden="true" className="text-primary size-4 shrink-0" />
                            {file.url === null ? (
                                <span className="text-body text-ink truncate">{file.name}</span>
                            ) : (
                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-body text-primary truncate underline-offset-2 hover:underline"
                                >
                                    {file.name}
                                </a>
                            )}
                            {file.size === null ? null : (
                                <span className="text-caption text-muted shrink-0 tabular-nums">{formatFileSize(file.size)}</span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </dd>
    </ReviewLine>
);

interface SubmittedAnswerLinesProps {
    item: SubmittedAnswer;
    answerLabel: string;
    filesLabel: string;
    status?: ReviewStatus;
}

export const SubmittedAnswerLines = ({ item, answerLabel, filesLabel, status }: SubmittedAnswerLinesProps) => (
    <>
        {item.type === 'short_answer' && item.yourAnswer.length === 0 && item.yourAttachments.length > 0 ? null : (
            <AnswerLine label={answerLabel} values={item.yourAnswer} rich={item.type === 'short_answer'} status={status} />
        )}
        {item.yourAttachments.length === 0 ? null : <AttachmentLine label={filesLabel} files={item.yourAttachments} status={status} />}
    </>
);
