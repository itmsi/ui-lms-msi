import { CircleCheck, CircleDashed, CircleDot, FileImage, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import type { BadgeTone } from '@/components/ui/Badge';
import { RichText } from '@/components/ui/RichText';
import { strings } from '@/locales/id';
import type { QuestionReview, SubmittedAttachment } from '@/types/quiz';
import { formatFileSize, isImageName } from '@/utils/attachmentUpload';

export type ReviewStatus = 'correct' | 'incorrect' | 'unanswered';

const STATUS_STYLE: Record<ReviewStatus, { icon: LucideIcon; label: string; tone: BadgeTone }> = {
    correct: { icon: CircleCheck, label: strings.myQuiz.reviewCorrect, tone: 'success' },
    incorrect: { icon: CircleDot, label: strings.myQuiz.reviewIncorrect, tone: 'warning' },
    unanswered: { icon: CircleDashed, label: strings.myQuiz.noAnswer, tone: 'neutral' },
};

type SubmittedAnswer = Pick<QuestionReview, 'type' | 'yourAnswer' | 'yourAttachments'>;

export const ReviewStatusBadge = ({ status }: { status: ReviewStatus }) => (
    <Badge tone={STATUS_STYLE[status].tone} icon={STATUS_STYLE[status].icon}>
        {STATUS_STYLE[status].label}
    </Badge>
);

export const AnswerLine = ({ label, values, rich = false }: { label: string; values: string[]; rich?: boolean }) => (
    <div className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-caption text-muted">{label}</dt>
        <dd className="text-body text-ink min-w-0">
            {values.length === 0 ? strings.myQuiz.noAnswer : rich ? <RichText html={values.join('')} /> : values.join(', ')}
        </dd>
    </div>
);

export const AttachmentLine = ({ label, files }: { label: string; files: SubmittedAttachment[] }) => (
    <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-caption text-muted">{label}</dt>
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
    </div>
);

interface SubmittedAnswerLinesProps {
    item: SubmittedAnswer;
    answerLabel: string;
    filesLabel: string;
}

export const SubmittedAnswerLines = ({ item, answerLabel, filesLabel }: SubmittedAnswerLinesProps) => (
    <>
        {item.type === 'short_answer' && item.yourAnswer.length === 0 && item.yourAttachments.length > 0 ? null : (
            <AnswerLine label={answerLabel} values={item.yourAnswer} rich={item.type === 'short_answer'} />
        )}
        {item.yourAttachments.length === 0 ? null : <AttachmentLine label={filesLabel} files={item.yourAttachments} />}
    </>
);
