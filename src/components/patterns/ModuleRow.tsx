import { ImageOff, Paperclip } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Card } from '@/components/ui/Card';
import { ModuleCategoryBadge } from '@/components/ui/ModuleCategoryBadge';
import { strings } from '@/locales/id';
import type { LearningModule } from '@/types/module';

interface ModuleRowProps {
    material: LearningModule;
    to: string;
    showCategoryBadge?: boolean;
}

export const ModuleRow = ({ material, to, showCategoryBadge = true }: ModuleRowProps) => {
    const [bannerFailed, setBannerFailed] = useState(false);
    const showBanner = material.banner !== null && bannerFailed === false;

    return (
        <Link to={to} aria-label={`${strings.library.openMaterial}: ${material.title}`} className="block">
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
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                        <h3 className="text-card text-ink line-clamp-1">{material.title}</h3>
                        {showCategoryBadge && material.category !== null ? (
                            <ModuleCategoryBadge category={material.category} />
                        ) : null}
                    </div>

                    {material.descriptionClean === null ? null : (
                        <p className="text-body text-muted line-clamp-2">{material.descriptionClean}</p>
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
