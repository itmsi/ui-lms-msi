import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Card } from '@/components/ui/Card';
import { ModuleCategoryBadge } from '@/components/ui/ModuleCategoryBadge';
import { strings } from '@/locales/id';
import type { LearningModule } from '@/types/module';

import './sticky-note.css';

interface ModuleThumbnailCardProps {
    material: LearningModule;
    to: string;
    ariaLabel?: string;
    showCategoryBadge?: boolean;
}

export const ModuleThumbnailCard = ({ material, to, ariaLabel, showCategoryBadge = true }: ModuleThumbnailCardProps) => {
    const [bannerFailed, setBannerFailed] = useState(false);
    const showBanner = material.banner !== null && bannerFailed === false;

    return (
        <Link
            to={to}
            aria-label={ariaLabel ?? `${strings.library.openMaterial}: ${material.title}`}
            className="sticky-note block h-full"
        >
            <Card className="flex h-full flex-col overflow-hidden border-0 p-1 shadow-none bg-gradiend">
                <div className="bg-neutral-soft relative aspect-video w-full overflow-hidden rounded-[3px]">
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

                </div>

                <div className="flex flex-1 flex-col gap-1.5 p-4">
                    <h3 className="text-card font-primary text-md text-[#8ebde8] line-clamp-2">{material.title}</h3>

                    {material.descriptionClean === null ? null : (
                        <p className="text-body text-white">{material.descriptionClean}</p>
                    )}

                    {showCategoryBadge && material.category !== null ? (
                        <div>
                            <ModuleCategoryBadge category={material.category} />
                        </div>
                    ) : null}
                </div>
            </Card>
        </Link>
    );
};
