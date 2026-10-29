import { CircleCheck, CircleDashed, CircleDot, FileImage, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useId } from 'react';

import { Card } from '@/components/ui/Card';
import { RichText } from '@/components/ui/RichText';
import { strings } from '@/locales/id';
import type { QuestionReview, SubmittedAttachment } from '@/types/quiz';
import { formatFileSize, isImageName } from '@/utils/attachmentUpload';
import { cn } from '@/utils/cn';

type ReviewStatus = 'correct' | 'incorrect' | 'unanswered';

const STATUS_STYLE: Record<ReviewStatus, { icon: LucideIcon; label: string; className: string }> = {
    correct: { icon: CircleCheck, label: strings.myQuiz.reviewCorrect, className: 'bg-success-soft text-success-ink' },
    incorrect: { icon: CircleDot, label: strings.myQuiz.reviewIncorrect, className: 'bg-warning-soft text-warning-ink' },
    unanswered: { icon: CircleDashed, label: strings.myQuiz.noAnswer, className: 'bg-neutral-soft text-neutral-ink' },
};

const statusOf = (item: QuestionReview): ReviewStatus => {
    if (item.isCorrect) {
        return 'correct';
    }

    return item.yourAnswer.length === 0 && item.yourAttachments.length === 0 ? 'unanswered' : 'incorrect';
};

const AnswerLine = ({ label, values, rich = false }: { label: string; values: string[]; rich?: boolean }) => (
    <div className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-caption text-muted">{label}</dt>
        <dd className="text-body text-ink min-w-0">
            {values.length === 0 ? strings.myQuiz.noAnswer : rich ? <RichText html={values.join('')} /> : values.join(', ')}
        </dd>
    </div>
);

const AttachmentLine = ({ files }: { files: SubmittedAttachment[] }) => (
    <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-caption text-muted">{strings.myQuiz.yourFiles}</dt>
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

export const AnswerReviewList = ({ items }: { items: QuestionReview[] }) => {
    const headingId = useId();

    return (
        <section aria-labelledby={headingId} className="flex flex-col gap-3">
            <h2 id={headingId} className="text-section font-sans">
                {strings.myQuiz.reviewHeading}
            </h2>

            <ol className="flex flex-col gap-3">
                {items.map((item) => {
                    const status = statusOf(item);
                    const { icon: Icon, label, className } = STATUS_STYLE[status];

                    return (
                        <li key={item.questionId}>
                            <Card className="flex flex-col gap-3 p-4 sm:p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-caption text-muted font-semibold tabular-nums">
                                        {`${strings.myQuiz.questionLabel} ${String(item.line)}`}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="text-caption text-muted tabular-nums">
                                            {`${String(item.pointsEarned)}/${String(item.points)} ${strings.myQuiz.pointsSuffix}`}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-caption inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium',
                                                className,
                                            )}
                                        >
                                            <Icon aria-hidden="true" className="size-3.5" />
                                            {label}
                                        </span>
                                    </span>
                                </div>

                                <p className="text-body text-ink font-medium whitespace-pre-line">{item.text}</p>

                                <dl className="bg-background flex flex-col gap-2.5 rounded-lg p-3">
                                    {item.type === 'short_answer' &&
                                    item.yourAnswer.length === 0 &&
                                    item.yourAttachments.length > 0 ? null : (
                                        <AnswerLine
                                            label={strings.myQuiz.yourAnswer}
                                            values={item.yourAnswer}
                                            rich={item.type === 'short_answer'}
                                        />
                                    )}
                                    {item.yourAttachments.length === 0 ? null : <AttachmentLine files={item.yourAttachments} />}
                                    {status === 'correct' ? null : (
                                        <AnswerLine
                                            label={strings.myQuiz.correctAnswer}
                                            values={item.correctAnswer}
                                            rich={item.type === 'short_answer'}
                                        />
                                    )}
                                </dl>
                            </Card>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
};
