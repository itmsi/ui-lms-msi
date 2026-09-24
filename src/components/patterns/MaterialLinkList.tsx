import { ExternalLink, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { strings } from '@/locales/id';
import { resolveEmbed } from '@/utils/embedSource';
import type { EmbedSource } from '@/utils/embedSource';

interface MaterialLinkListProps {
    links: string[];
}

interface EmbedCardProps {
    /** Tautan asli dari instruktur — tujuan tombol "Buka di …", bukan alamat iframe. */
    link: string;
    source: EmbedSource;
}

const EmbedCard = ({ link, source }: EmbedCardProps) => {
    const [reloadKey, setReloadKey] = useState(0);

    return (
        <li className="border-line bg-surface flex flex-col gap-2 rounded-lg border p-3">
            <div className="bg-neutral-soft aspect-video w-full overflow-hidden rounded-md">
                <iframe
                    key={reloadKey}
                    src={source.src}
                    title={`${strings.materialDetail.embedTitle} ${source.label}`}
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
                    className="size-full"
                />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <p className="text-caption text-muted">
                    {source.id === 'wedrive'
                        ? strings.materialDetail.embedHintWeDrive
                        : strings.materialDetail.embedHintGeneric}
                </p>

                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReloadKey((current) => current + 1)}
                        leadingIcon={<RefreshCw aria-hidden="true" className="size-4" />}
                    >
                        {strings.materialDetail.reloadPreview}
                    </Button>

                    {/* `rel="noopener noreferrer"` wajib pada tautan bertarget baru. */}
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark text-caption flex shrink-0 items-center gap-1 font-medium"
                    >
                        <ExternalLink aria-hidden="true" className="size-3.5" />
                        {`${strings.materialDetail.openIn} ${source.label}`}
                    </a>
                </div>
            </div>
        </li>
    );
};

export const MaterialLinkList = ({ links }: MaterialLinkListProps) => {
    if (links.length === 0) {
        return <p className="text-body text-muted">{strings.materialDetail.noLinks}</p>;
    }

    return (
        <ul className="flex flex-col gap-2">
            {links.map((link, index) => {
                // Berbasis posisi juga: tautan yang sama bisa tersimpan dua kali dalam satu daftar.
                const key = `${String(index)}:${link}`;
                const source = resolveEmbed(link);

                return source === null ? (
                    <li key={key}>
                        {/*
                          * `rel="noopener noreferrer"` wajib pada tautan bertarget baru:
                          * tanpa itu halaman tujuan bisa mengakses `window.opener`.
                          */}
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border-line bg-surface hover:border-primary text-body text-ink flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors"
                        >
                            <ExternalLink aria-hidden="true" className="text-muted size-4 shrink-0" />
                            <span className="min-w-0 flex-1 truncate">{link}</span>
                            <span className="sr-only">{strings.materialDetail.openLinkHint}</span>
                        </a>
                    </li>
                ) : (
                    <EmbedCard key={key} link={link} source={source} />
                );
            })}
        </ul>
    );
};
