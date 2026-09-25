import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Card } from '@/components/ui/Card';
import { ModuleCategoryBadge } from '@/components/ui/ModuleCategoryBadge';
import { strings } from '@/locales/id';
import type { LearningModule } from '@/types/module';

interface MaterialRowProps {
    material: LearningModule;
}

export const MaterialRow = ({ material }: MaterialRowProps) => {
    const [bannerFailed, setBannerFailed] = useState(false);
    const showBanner = material.banner !== null && bannerFailed === false;

    return (
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
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                        <h3 className="text-card text-ink line-clamp-1">{material.title}</h3>
                        {material.category === null ? null : <ModuleCategoryBadge category={material.category} />}
                    </div>

                    {material.descriptionClean === null ? null : (
                        <p className="text-body text-muted">{material.descriptionClean}</p>
                    )}

                </div>
            </Card>
        </Link>
    );
};
