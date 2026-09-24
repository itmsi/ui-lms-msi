import { ImageOff, Paperclip } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Card } from '@/components/ui/Card';
import { ModuleCategoryBadge } from '@/components/ui/ModuleCategoryBadge';
import { strings } from '@/locales/id';
import type { LearningModule } from '@/types/module';

interface MaterialRowProps {
    material: LearningModule;
}

/**
 * Baris padat untuk pengelolaan — bukan kartu katalog. Thumbnail dibuat kecil dan
 * badge kategori diletakkan sebaris judul sebagai metadata, bukan elemen utama.
 */
export const MaterialRow = ({ material }: MaterialRowProps) => {
    const [bannerFailed, setBannerFailed] = useState(false);
    const showBanner = material.banner !== null && bannerFailed === false;

    return (
        // Kini benar-benar bisa diklik, jadi efek hover `interactive` bukan janji kosong.
        <Link to={`/materials/${material.id}`} className="block">
        <Card interactive className="flex items-start gap-4 p-3">
            <div className="bg-neutral-soft aspect-video w-32 shrink-0 overflow-hidden rounded-lg">
                {showBanner ? (
                    <img
                        src={material.banner ?? ''}
                        alt=""
                        loading="lazy"
                        onError={() => setBannerFailed(true)}
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="text-neutral-line flex size-full items-center justify-center">
                        <ImageOff aria-hidden="true" className="size-5" />
                        <span className="sr-only">{strings.library.noBanner}</span>
                    </div>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-card text-ink line-clamp-1">{material.title}</h3>
                    {material.category === null ? null : <ModuleCategoryBadge category={material.category} />}
                </div>

                {material.description === null ? null : (
                    <p className="text-body text-muted line-clamp-2">{material.description}</p>
                )}

                {material.linkMaterials.length === 0 ? null : (
                    <p className="text-caption text-muted flex items-center gap-1.5 pt-1">
                        <Paperclip aria-hidden="true" className="size-3.5 shrink-0" />
                        {material.linkMaterials.length} {strings.library.materialsSuffix}
                    </p>
                )}
            </div>
        </Card>
        </Link>
    );
};
