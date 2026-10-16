import { ArrowUpRight, BookOpen, ExternalLink, Link2, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { strings } from '@/locales/id';
import type { MaterialLink } from '@/types/module';
import { resolveEmbed, resolveLinkType } from '@/utils/embedSource';
import type { EmbedSource } from '@/utils/embedSource';

import './clipboard-card.css';

interface MaterialLinkListProps {
    links: MaterialLink[];
    onOpenLink?: (material: MaterialLink) => void;
}

interface EmbedCardProps {
    material: MaterialLink;
    source: EmbedSource;
    onOpenLink?: (material: MaterialLink) => void;
}

const toHostname = (link: string): string => {
    try {
        return new URL(link).hostname;
    } catch {
        return link;
    }
};

interface LinkCardProps {
    material: MaterialLink;
    sourceLabel: string | null;
    onOpenLink?: (material: MaterialLink) => void;
}

const LinkCard = ({ material, sourceLabel, onOpenLink }: LinkCardProps) => {
    const link = material.link;
    const hostname = toHostname(link);
    const openLabel = sourceLabel === null ? strings.materialDetail.openLink : `${strings.materialDetail.openIn} ${sourceLabel}`;
    const typeLabel = resolveLinkType(link) ?? sourceLabel;
    const heading = material.title === '' ? (typeLabel ?? hostname) : material.title;

    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onOpenLink?.(material)}
            onAuxClick={(event) => {
                if (event.button === 1) {
                    onOpenLink?.(material);
                }
            }}
            aria-label={`${openLabel}: ${heading}`}
            className="clipboard-card"
        >
            <span className="clipboard-card-sheet">
                <span aria-hidden="true" className="clipboard-card-icon">
                    {sourceLabel === null ? <Link2 className="size-5" /> : <BookOpen className="size-5" />}
                </span>

                <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-display text-card text-ink line-clamp-2">{heading}</span>
                    <span className="text-caption text-muted truncate">
                        {typeLabel === null || material.title === '' ? hostname : `${typeLabel} · ${hostname}`}
                    </span>
                </span>

                <span aria-hidden="true" className="clipboard-card-arrow">
                    <ArrowUpRight className="size-4" />
                </span>
            </span>
        </a>
    );
};

const EmbedCard = ({ material, source, onOpenLink }: EmbedCardProps) => {
    const [reloadKey, setReloadKey] = useState(0);
    const link = material.link;

    return (
        <li className="flex flex-col gap-2">
            <LinkCard material={material} sourceLabel={source.label} onOpenLink={onOpenLink} />

            <div className="hidden">
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
                        {source.id === 'wedrive' ? strings.materialDetail.embedHintWeDrive : strings.materialDetail.embedHintGeneric}
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

                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onOpenLink?.(material)}
                            onAuxClick={(event) => {
                                if (event.button === 1) {
                                    onOpenLink?.(material);
                                }
                            }}
                            className="text-primary hover:text-primary-dark text-caption flex shrink-0 items-center gap-1 font-medium"
                        >
                            <ExternalLink aria-hidden="true" className="size-3.5" />
                            {`${strings.materialDetail.openIn} ${source.label}`}
                        </a>
                    </div>
                </div>
            </div>
        </li>
    );
};

export const MaterialLinkList = ({ links, onOpenLink }: MaterialLinkListProps) => {
    // if (links.length === 0) {
    //     return <p className="text-body text-muted">{strings.materialDetail.noLinks}</p>;
    // }

    return (
        <ul className="flex flex-col gap-6 pt-2">
            {links.map((material, index) => {
                const key = `${String(index)}:${material.link}`;
                const source = resolveEmbed(material.link);

                return source === null ? (
                    <li key={key}>
                        <LinkCard material={material} sourceLabel={null} />
                    </li>
                ) : (
                    <EmbedCard key={key} material={material} source={source} onOpenLink={onOpenLink} />
                );
            })}
        </ul>
    );
};
