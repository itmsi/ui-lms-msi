import { ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import type { ChangeEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { strings } from '@/locales/id';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface BannerFieldProps {
    file: File | null;
    error?: string;
    currentUrl?: string | null;
    onChange: (file: File | null, error: string | null) => void;
}

export const BannerField = ({ file, error, currentUrl = null, onChange }: BannerFieldProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const previewUrl = useMemo(() => (file === null ? null : URL.createObjectURL(file)), [file]);
    const displayUrl = previewUrl ?? currentUrl;
    const hasBanner = file !== null || currentUrl !== null;

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

        if (ACCEPTED_TYPES.includes(picked.type) === false) {
            onChange(null, strings.materialEditor.errorBannerType);
            return;
        }

        if (picked.size > MAX_SIZE_BYTES) {
            onChange(null, strings.materialEditor.errorBannerSize);
            return;
        }

        onChange(picked, null);
    };

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-body text-ink font-medium">{strings.materialEditor.bannerLabel}</span>

            <div className="flex flex-wrap items-start gap-3">
                <div className="bg-neutral-soft border-line aspect-video w-48 shrink-0 overflow-hidden rounded-lg border">
                    {displayUrl === null ? (
                        <div className="text-neutral-line flex size-full items-center justify-center">
                            <ImagePlus aria-hidden="true" className="size-6" />
                        </div>
                    ) : (
                        <img src={displayUrl} alt="" className="size-full object-cover" />
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPTED_TYPES.join(',')}
                        onChange={handlePick}
                        className="sr-only"
                        tabIndex={-1}
                    />

                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
                            {hasBanner ? strings.materialEditor.bannerReplace : strings.materialEditor.bannerChoose}
                        </Button>

                        {hasBanner ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onChange(null, null)}
                                leadingIcon={<Trash2 aria-hidden="true" className="size-4" />}
                            >
                                {strings.materialEditor.bannerRemove}
                            </Button>
                        ) : null}
                    </div>

                    <p className="text-caption text-muted">
                        {file === null && currentUrl !== null
                            ? strings.materialEditor.bannerCurrentHint
                            : strings.materialEditor.bannerHint}
                    </p>
                    <p className="text-caption text-muted">{strings.materialEditor.bannerSizeHint}</p>
                    {file === null ? null : <p className="text-caption text-ink truncate">{file.name}</p>}
                </div>
            </div>

            {error === undefined ? null : <p className="text-caption text-danger-ink">{error}</p>}
        </div>
    );
};
