import { ArrowDown, ArrowUp, FileText, Link2, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { strings } from '@/locales/id';
import { createLinkDraft } from '@/pages/Instructor/Materials/types';
import type { DraftErrors, LinkDraft } from '@/pages/Instructor/Materials/types';
import { moveItem, removeAt, replaceAt } from '@/utils/array';

interface LinkListFieldProps {
    links: LinkDraft[];
    errors: DraftErrors;
    onChange: (links: LinkDraft[]) => void;
    emptyText: string;
}

export const LinkListField = ({ links, errors, onChange, emptyText }: LinkListFieldProps) => (
    <div className="flex flex-col gap-2">
        {links.length === 0 ? <p className="text-caption text-muted">{emptyText}</p> : null}

        {links.map((link, index) => {
            const number = String(index + 1);

            return (
                <div key={link.key} className="border-line bg-surface flex items-start gap-2 border-b p-3 pb-4">
                    <span
                        aria-hidden="true"
                        className="bg-primary-light text-primary-dark text-caption mt-3 flex size-6 shrink-0 items-center justify-center rounded-full font-semibold tabular-nums"
                    >
                        {number}
                    </span>

                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                        <Input
                            label={`${strings.materialEditor.linkTitleLabel} ${number}`}
                            hideLabel
                            value={link.title}
                            placeholder={strings.materialEditor.linkTitlePlaceholder}
                            leading={<FileText aria-hidden="true" className="text-muted size-4" />}
                            onChange={(event) => onChange(replaceAt(links, index, { ...link, title: event.target.value }))}
                        />
                        <Input
                            label={`${strings.materialEditor.linkLabel} ${number}`}
                            hideLabel
                            type="url"
                            inputMode="url"
                            value={link.link}
                            placeholder={strings.materialEditor.linkPlaceholder}
                            error={errors[link.key]}
                            leading={<Link2 aria-hidden="true" className="text-muted size-4" />}
                            onChange={(event) => onChange(replaceAt(links, index, { ...link, link: event.target.value }))}
                        />
                    </div>

                    <div className="flex shrink-0 items-center pt-0.5">
                        <IconButton
                            label={strings.materialEditor.moveUp}
                            icon={<ArrowUp aria-hidden="true" className="size-4" />}
                            disabled={index === 0}
                            onClick={() => onChange(moveItem(links, index, index - 1))}
                        />
                        <IconButton
                            label={strings.materialEditor.moveDown}
                            icon={<ArrowDown aria-hidden="true" className="size-4" />}
                            disabled={index === links.length - 1}
                            onClick={() => onChange(moveItem(links, index, index + 1))}
                        />
                        <IconButton
                            label={strings.materialEditor.linkRemove}
                            icon={<X aria-hidden="true" className="size-4" />}
                            onClick={() => onChange(removeAt(links, index))}
                        />
                    </div>
                </div>
            );
        })}

        <div>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange([...links, createLinkDraft()])}
                leadingIcon={<Plus aria-hidden="true" className="size-4" />}
            >
                {strings.materialEditor.linkAdd}
            </Button>
        </div>
    </div>
);
