import { ImageOff } from 'lucide-react';

import { MaterialLinkList } from '@/components/patterns/MaterialLinkList';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LinkButton } from '@/components/ui/LinkButton';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { ModuleCategoryBadge } from '@/components/ui/ModuleCategoryBadge';
import { RichText } from '@/components/ui/RichText';
import type { ModuleDetailState } from '@/hooks/useModuleDetail';
import { strings } from '@/locales/id';

interface ModuleDetailViewProps {
    state: ModuleDetailState;
    onRetry: () => void;
    /** Tujuan tombol kembali saat materi tidak ditemukan. */
    backTo: string;
    backLabel: string;
    /**
     * Tingkat judul materi di atas banner. Halaman tanpa header sendiri (Perpustakaan)
     * memakai `h1`, supaya halaman tetap punya judul utama bagi pembaca layar.
     */
    titleAs?: 'h1' | 'h3';
    /** Matikan bila halaman sudah menampilkan kategori di tempat lain, mis. di header. */
    showCategoryBadge?: boolean;
}

const renderError = (
    state: Extract<ModuleDetailState, { status: 'error' }>,
    onRetry: () => void,
    backTo: string,
    backLabel: string,
) => {
    if (state.code === 'not_found') {
        return (
            <EmptyState
                title={strings.materialDetail.notFoundTitle}
                description={strings.materialDetail.notFoundBody}
                action={
                    <LinkButton to={backTo} variant="secondary" size="sm">
                        {backLabel}
                    </LinkButton>
                }
            />
        );
    }

    if (state.code === 'unauthorized') {
        return (
            <ErrorState
                title={strings.materialDetail.unauthorizedTitle}
                whatHappened={strings.apiErrors.unauthorizedHappened}
                whatYouCanDo={strings.apiErrors.unauthorizedDo}
                whatIsNext={strings.apiErrors.unauthorizedNext}
            />
        );
    }

    if (state.code === 'offline') {
        return (
            <ErrorState
                whatHappened={strings.apiErrors.offlineHappened}
                whatYouCanDo={strings.apiErrors.offlineDo}
                whatIsNext={strings.apiErrors.offlineNext}
                onRetry={onRetry}
            />
        );
    }

    if (state.code === 'validation' && state.message !== undefined) {
        return (
            <ErrorState
                whatHappened={state.message}
                whatYouCanDo={strings.apiErrors.validationDo}
                whatIsNext={strings.apiErrors.validationNext}
                onRetry={onRetry}
            />
        );
    }

    return <ErrorState onRetry={onRetry} />;
};

/**
 * Isi halaman detail Module: banner, judul, deskripsi, materi pendukung, dan lesson.
 * Dipakai bersama detail Perpustakaan dan detail Materi; yang membedakan keduanya
 * hanya header dan aksi di sekelilingnya.
 */
export const ModuleDetailView = ({
    state,
    onRetry,
    backTo,
    backLabel,
    titleAs: TitleTag = 'h3',
    showCategoryBadge = true,
}: ModuleDetailViewProps) => {
    if (state.status === 'loading') {
        return (
            <LoadingBlock label={strings.common.loading} className="flex flex-col gap-4">
                <Skeleton className="aspect-video w-full max-w-xl" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
            </LoadingBlock>
        );
    }

    if (state.status === 'error') {
        return <Card>{renderError(state, onRetry, backTo, backLabel)}</Card>;
    }

    const { detail } = state;

    return (
        <>
            <Card className="flex flex-col gap-5">
                <div className="bg-neutral-soft relative aspect-video w-full overflow-hidden rounded-lg">
                    {detail.banner === null ? (
                        <div className="text-neutral-line flex size-full items-center justify-center">
                            <ImageOff aria-hidden="true" className="size-6" />
                            <span className="sr-only">{strings.library.noBanner}</span>
                        </div>
                    ) : (
                        <img src={detail.banner} alt="" loading="lazy" className="size-full object-cover" />
                    )}

                    {/* Ditempel di atas banner supaya tetap terlihat walau gambarnya gagal dimuat. */}
                    {showCategoryBadge && detail.category !== null ? (
                        <ModuleCategoryBadge category={detail.category} className="absolute top-3 left-3" />
                    ) : null}
                </div>

                <div
                    className="bg-gradiend z-2 mx-auto flex min-h-22 w-[75%] items-center justify-center rounded-2xl px-7 py-4 text-center"
                    style={{ marginTop: '-68px' }}
                >
                    <TitleTag className="text-card font-display line-clamp-2 text-xl font-medium text-white uppercase">
                        {detail.title}
                    </TitleTag>
                </div>

                {detail.description === '' ? (
                    <p className="text-body text-muted">{strings.materialDetail.noDescription}</p>
                ) : (
                    <RichText className="p-5" html={detail.description} />
                )}
            </Card>

            <Card className="flex flex-col gap-3 p-5">
                <h2 className="text-section">{strings.materialDetail.sectionLinks}</h2>
                <MaterialLinkList links={detail.linkMaterials} />
            </Card>

            <Card className="flex flex-col gap-4 p-5">
                <h2 className="text-section">{strings.materialDetail.sectionLessons}</h2>

                {detail.chapters.length === 0 ? (
                    <p className="text-body text-muted">{strings.materialDetail.noLessons}</p>
                ) : (
                    <ol className="flex flex-col gap-4">
                        {detail.chapters.map((chapter) => (
                            <li key={chapter.id} className="border-line rounded-card border p-4">
                                <h3 className="text-card text-ink">{chapter.title}</h3>

                                <div className="mt-3">
                                    <MaterialLinkList links={chapter.linkMaterials} />
                                </div>

                                {chapter.description === '' ? null : (
                                    <RichText html={chapter.description} className="mt-2" />
                                )}
                            </li>
                        ))}
                    </ol>
                )}
            </Card>
        </>
    );
};
