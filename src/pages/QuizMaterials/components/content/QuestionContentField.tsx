import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { strings } from '@/locales/id';
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from '@/utils/imageUpload';

interface QuestionContentFieldProps {
    number: number;
    text: string;
    image: File | null;
    onChangeText: (text: string) => void;
    onChangeImage: (image: File | null) => void;
}

export const QuestionContentField = ({ number, text, image, onChangeText, onChangeImage }: QuestionContentFieldProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const previewUrl = useMemo(() => (image === null ? null : URL.createObjectURL(image)), [image]);

    useEffect(
        () => () => {
            if (previewUrl !== null) {
                URL.revokeObjectURL(previewUrl);
            }
        },
        [previewUrl],
    );

    const handlePick = (event: ChangeEvent<HTMLInputElement>) => {
        const picked = event.target.files?.[0] ?? null;

        event.target.value = '';

        if (picked === null) {
            return;
        }

        const problem = validateImageFile(picked);

        setImageError(problem);

        if (problem === null) {
            onChangeImage(picked);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-card text-ink">{`${strings.quizContent.questionPrefix} ${String(number)}`}</h3>

            <Textarea
                label={strings.quizContent.textLabel}
                hideLabel
                rows={3}
                value={text}
                placeholder={strings.quizContent.textPlaceholder}
                onChange={(event) => onChangeText(event.target.value)}
                textareaClassName="bg-background"
            />

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                onChange={handlePick}
                className="sr-only"
                tabIndex={-1}
            />

            {previewUrl === null ? (
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => inputRef.current?.click()}
                        leadingIcon={<ImagePlus aria-hidden="true" className="size-4" />}
                    >
                        {strings.quizContent.imageAdd}
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <img
                        src={previewUrl}
                        alt={strings.quizContent.imagePreviewAlt}
                        className="border-line aspect-video w-full max-w-64 rounded-lg border object-cover"
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => inputRef.current?.click()}
                            leadingIcon={<RefreshCw aria-hidden="true" className="size-4" />}
                        >
                            {strings.quizContent.imageReplace}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setImageError(null);
                                onChangeImage(null);
                            }}
                            leadingIcon={<Trash2 aria-hidden="true" className="size-4" />}
                            className="text-danger-ink hover:bg-danger-soft"
                        >
                            {strings.quizContent.imageRemove}
                        </Button>
                    </div>
                </div>
            )}

            {imageError === null ? null : <p className="text-caption text-danger-ink">{imageError}</p>}
        </div>
    );
};
