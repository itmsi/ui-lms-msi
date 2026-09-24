import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';

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

/**
 * Urutan diubah lewat tombol naik/turun, bukan drag — tombol bisa dipakai keyboard
 * dan screen reader, sementara drag saja tidak. Kalau drag ditambahkan nanti, tombol
 * ini tetap harus ada sebagai jalur setara.
 */
export const LinkListField = ({ links, errors, onChange, emptyText }: LinkListFieldProps) => (
    <div className="flex flex-col gap-2">
        {links.length === 0 ? <p className="text-caption text-muted">{emptyText}</p> : null}

        {links.map((link, index) => (
            <div key={link.key} className="flex items-start gap-1">
                <Input
                    label={`${strings.materialEditor.linkLabel} ${String(index + 1)}`}
                    hideLabel
                    type="url"
                    inputMode="url"
                    value={link.value}
                    placeholder={strings.materialEditor.linkPlaceholder}
                    error={errors[link.key]}
                    onChange={(event) => onChange(replaceAt(links, index, { ...link, value: event.target.value }))}
                    className="min-w-0 flex-1"
                />

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
                    {/*
                      * Sengaja memakai ikon silang, bukan tempat sampah: tempat sampah
                      * dipakai khusus untuk menghapus seluruh lesson. Dua tombol yang
                      * terlihat sama padahal akibatnya berbeda jauh adalah jebakan.
                      */}
                    <IconButton
                        label={strings.materialEditor.linkRemove}
                        icon={<X aria-hidden="true" className="size-4" />}
                        onClick={() => onChange(removeAt(links, index))}
                    />
                </div>
            </div>
        ))}

        {/*
          * Sengaja `ghost` dan kecil: ini aksi di dalam satu field. "Tambah lesson"
          * bekerja satu tingkat di atasnya dan berbentuk blok bergaris putus-putus,
          * jadi keduanya tidak bisa tertukar meski letaknya berdekatan.
          */}
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
