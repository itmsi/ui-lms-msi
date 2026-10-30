import { FileText, Upload, X } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useCallback, useId, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';

import { IconButton } from '@/components/ui/IconButton';
import { strings } from '@/locales/id';
import { listItemMotion } from '@/pages/Candidate/Quiz/utils/quizMotion';
import { cn } from '@/utils/cn';
import { ATTACHMENT_ACCEPT, MAX_ATTACHMENTS, formatFileSize, isImageName, validateAttachment } from '@/utils/attachmentUpload';

const fileKey = (file: File) => `${file.name}:${String(file.size)}:${String(file.lastModified)}`;

const AttachmentThumb = ({ file }: { file: File }) => {
    const attachPreview = useCallback(
        (node: HTMLImageElement | null) => {
            if (node === null) {
                return;
            }

            const url = URL.createObjectURL(file);

            node.src = url;

            return () => URL.revokeObjectURL(url);
        },
        [file],
    );

    return <img ref={attachPreview} alt="" className="border-line size-11 shrink-0 rounded-md border object-cover" />;
};

interface AnswerAttachmentsProps {
    files: readonly File[];
    onChange: (files: File[]) => void;
}

export const AnswerAttachments = ({ files, onChange }: AnswerAttachmentsProps) => {
    const baseId = useId();
    const labelId = `${baseId}-label`;
    const hintId = `${baseId}-hint`;
    const [problems, setProblems] = useState<string[]>([]);
    const [dragging, setDragging] = useState(false);
    const isFull = files.length >= MAX_ATTACHMENTS;

    const addFiles = (picked: FileList | null) => {
        if (picked === null || picked.length === 0) {
            return;
        }

        const known = new Set(files.map(fileKey));
        const rejected: string[] = [];
        const accepted: File[] = [];

        Array.from(picked).forEach((file) => {
            const problem = validateAttachment(file);

            if (problem !== null) {
                rejected.push(`${file.name} (${problem === 'type' ? strings.myQuiz.attachErrorType : strings.myQuiz.attachErrorSize})`);
                return;
            }

            if (known.has(fileKey(file)) === false) {
                known.add(fileKey(file));
                accepted.push(file);
            }
        });

        const room = Math.max(MAX_ATTACHMENTS - files.length, 0);
        const overflow = accepted.slice(room).map((file) => file.name);
        const messages = [
            rejected.length === 0 ? null : `${strings.myQuiz.attachErrorPrefix} ${rejected.join(', ')}.`,
            overflow.length === 0 ? null : `${strings.myQuiz.attachErrorCount} ${overflow.join(', ')}.`,
        ].filter((message): message is string => message !== null);

        setProblems(messages);

        if (room > 0 && accepted.length > 0) {
            onChange([...files, ...accepted.slice(0, room)]);
        }
    };

    const handlePick = (event: ChangeEvent<HTMLInputElement>) => {
        addFiles(event.target.files);
        event.target.value = '';
    };

    const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
        if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) {
            return;
        }

        setDragging(false);
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setDragging(false);
        addFiles(event.dataTransfer.files);
    };

    const remove = (target: File) => {
        setProblems([]);
        onChange(files.filter((file) => file !== target));
    };

    return (
        <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
                <span id={labelId} className="text-body text-ink font-medium">
                    {strings.myQuiz.attachLabel}
                </span>
                {files.length === 0 ? null : (
                    <span className="text-caption text-muted tabular-nums">
                        {`${String(files.length)}/${String(MAX_ATTACHMENTS)} ${strings.myQuiz.attachCount}`}
                    </span>
                )}
            </div>

            {isFull ? (
                <p className="text-caption text-muted bg-neutral-soft/60 rounded-lg px-3.5 py-3">{strings.myQuiz.attachFull}</p>
            ) : (
                <label
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        'flex min-h-12 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-4 py-4 text-center',
                        'transition-[background-color,border-color,transform] duration-200 ease-out active:scale-[0.99]',
                        'has-focus-visible:outline-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-2',
                        dragging
                            ? 'border-primary bg-primary-light'
                            : 'border-line bg-background hover:border-primary/60 hover:bg-primary-light/40',
                    )}
                >
                    <input
                        type="file"
                        multiple
                        accept={ATTACHMENT_ACCEPT}
                        aria-describedby={hintId}
                        onChange={handlePick}
                        className="sr-only"
                    />
                    <span className="text-primary flex items-center gap-2 font-medium">
                        <Upload aria-hidden="true" className="size-4" />
                        <span className="text-body">{strings.myQuiz.attachAction}</span>
                    </span>
                    <span className="text-caption text-muted hidden sm:inline">{strings.myQuiz.attachDrop}</span>
                </label>
            )}

            <p id={hintId} className="text-caption text-muted">
                {strings.myQuiz.attachHint}
            </p>

            <div aria-live="polite" className="empty:hidden">
                {problems.map((message) => (
                    <p key={message} className="text-caption text-danger-ink">
                        {message}
                    </p>
                ))}
            </div>

            {files.length === 0 ? null : (
                <ul className="flex flex-col gap-2">
                    <AnimatePresence initial={false}>
                        {files.map((file) => (
                            <m.li
                                key={fileKey(file)}
                                {...listItemMotion}
                                className="border-line bg-surface flex items-center gap-3 rounded-lg border py-2 pr-1 pl-2"
                            >
                                {isImageName(file.name) ? (
                                    <AttachmentThumb file={file} />
                                ) : (
                                    <span
                                        aria-hidden="true"
                                        className="bg-primary-light text-primary flex size-11 shrink-0 items-center justify-center rounded-md"
                                    >
                                        <FileText className="size-5" />
                                    </span>
                                )}
                                <span className="flex min-w-0 flex-1 flex-col">
                                    <span className="text-body text-ink truncate font-medium">{file.name}</span>
                                    <span className="text-caption text-muted tabular-nums">{formatFileSize(file.size)}</span>
                                </span>
                                <IconButton
                                    label={`${strings.myQuiz.attachRemove} ${file.name}`}
                                    tone="danger"
                                    icon={<X aria-hidden="true" className="size-4" />}
                                    onClick={() => remove(file)}
                                    className="size-11"
                                />
                            </m.li>
                        ))}
                    </AnimatePresence>
                </ul>
            )}
        </div>
    );
};
