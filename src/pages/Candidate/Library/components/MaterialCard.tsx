import { ImageOff, Paperclip } from 'lucide-react';
import { useState } from 'react';

import { Card } from '@/components/ui/Card';
import { ModuleCategoryBadge } from '@/components/ui/ModuleCategoryBadge';
import { strings } from '@/locales/id';
import type { LibraryModule } from '@/pages/Candidate/Library/types';

interface MaterialCardProps {
    material: LibraryModule;
}

/**
 * Kartu katalog: thumbnail 16:9, judul dua baris, deskripsi dua baris, lalu satu baris
 * metadata. Tingginya sengaja ditahan supaya satu baris grid tetap sejajar dan padat.
 *
 * Belum bisa diklik: layar detail Perpustakaan belum ada dan endpoint-nya belum
 * dikonfirmasi. Karena itu tidak ada ikon panah — penanda yang tidak menuju ke mana pun
 * hanya menjanjikan sesuatu yang tak ada. Tidak ada progress bar, tombol "Lanjut",
 * maupun state terkunci: Perpustakaan memang bebas dijelajahi.
 */
export const MaterialCard = ({ material }: MaterialCardProps) => {
    const [bannerFailed, setBannerFailed] = useState(false);
    const showBanner = material.banner !== null && bannerFailed === false;

    return (
        <Card className="hover:border-neutral-line flex h-full flex-col overflow-hidden transition-colors p-1 bg-gradiend">
            {/* Rasio ditetapkan supaya tata letak tidak bergeser saat gambar selesai dimuat. */}
            <div className="bg-neutral-soft relative aspect-video w-full rounded-xl overflow-hidden">
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
                        <ImageOff aria-hidden="true" className="size-6" />
                        <span className="sr-only">{strings.library.noBanner}</span>
                    </div>
                )}

                {/* Ditempel di atas thumbnail supaya tetap terlihat walau gambarnya gagal dimuat. */}
                {material.category === null ? null : (
                    <ModuleCategoryBadge category={material.category} className="absolute top-2 left-2" />
                )}
            </div>

            <div className="flex flex-1 flex-col gap-1.5 p-4">
                <h3 className="text-card font-primary text-md text-[#8ebde8] line-clamp-2">{material.title}</h3>

                {material.description === null ? null : (
                    <p className="text-body text-white line-clamp-2">{material.description}</p>
                )}

                {material.linkMaterials.length === 0 ? null : (
                    <p className="text-caption text-white border-line mt-auto flex items-center gap-1.5 border-t pt-3">
                        <Paperclip aria-hidden="true" className="size-3.5 shrink-0" />
                        {material.linkMaterials.length} {strings.library.materialsSuffix}
                    </p>
                )}
            </div>
        </Card>
    );
};
