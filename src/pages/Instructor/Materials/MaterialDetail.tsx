import { ImageOff, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

import PageHeaderDetail from '@/components/patterns/PageHeaderDetail';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LinkButton } from '@/components/ui/LinkButton';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { ModuleCategoryBadge } from '@/components/ui/ModuleCategoryBadge';
import { RichText } from '@/components/ui/RichText';
import { useMaterialsAccess } from '@/hooks/useMaterialsAccess';
import { strings } from '@/locales/id';
import { MaterialLinkList } from '@/pages/Instructor/Materials/components/MaterialLinkList';
import { useMaterialDetail } from '@/pages/Instructor/Materials/hooks/useMaterialDetail';
import type { MaterialDetailState } from '@/pages/Instructor/Materials/hooks/useMaterialDetail';
import { deleteMaterial } from '@/pages/Instructor/Materials/services/materialService';
import type { DeleteMaterialOutcome } from '@/pages/Instructor/Materials/services/materialService';

const renderError = (state: Extract<MaterialDetailState, { status: 'error' }>, onRetry: () => void) => {
    if (state.code === 'not_found') {
        return (
            <EmptyState
                title={strings.materialDetail.notFoundTitle}
                description={strings.materialDetail.notFoundBody}
                action={
                    <LinkButton to="/materials" variant="secondary" size="sm">
                        {strings.materialDetail.backToList}
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

const deleteFailureMessage = (outcome: Extract<DeleteMaterialOutcome, { ok: false }>): string => {
    if (outcome.code === 'validation' && outcome.message !== undefined) {
        return outcome.message;
    }

    if (outcome.code === 'unauthorized') {
        return strings.materialDetail.deleteUnauthorized;
    }

    return outcome.code === 'offline' ? strings.materialDetail.deleteOffline : strings.materialDetail.deleteFailed;
};

export const MaterialDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state, retry } = useMaterialDetail(id);
    const { canUpdate, canDelete } = useMaterialsAccess();

    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const title = state.status === 'success' ? state.detail.title : strings.nav.materials;

    const handleDelete = useCallback(() => {
        if (id === undefined || isDeleting) {
            return;
        }

        setIsDeleting(true);

        const run = async () => {
            const outcome = await deleteMaterial(id);

            if (outcome.ok) {
                toast.success(strings.materialDetail.deleted);
                void navigate('/materials');
                return;
            }

            setIsDeleting(false);
            setConfirmingDelete(false);
            toast.error(deleteFailureMessage(outcome));
        };

        void run();
    }, [id, isDeleting, navigate]);

    const actions =
        state.status === 'success' && (canUpdate || canDelete) ? (
            <>
                {state.detail.category &&
                    <ModuleCategoryBadge category={state.detail.category} />
                }
                {canUpdate ? (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            if (id !== undefined) {
                                void navigate(`/materials/${id}/edit`);
                            }
                        }}
                        leadingIcon={<Pencil aria-hidden="true" className="size-4" />}
                    >
                        {strings.materialDetail.edit}
                    </Button>
                ) : null}

                {canDelete ? (
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setConfirmingDelete(true)}
                        leadingIcon={<Trash2 aria-hidden="true" className="size-4" />}
                    >
                        {strings.materialDetail.delete}
                    </Button>
                ) : null}

            </>
        ) : null;

    return (
        <section className="flex flex-col gap-5">
            <PageHeaderDetail
                title={title}
                backPath="/materials"
                actions={actions}
            />

            {state.status === 'loading' ? (
                <LoadingBlock label={strings.common.loading} className="flex flex-col gap-4">
                    <Skeleton className="aspect-video w-full max-w-xl" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                </LoadingBlock>
            ) : null}

            {state.status === 'error' ? <Card>{renderError(state, retry)}</Card> : null}

            {state.status === 'success' ? (
                <>
                    <Card className="flex flex-col gap-5">
                        <div className="bg-neutral-soft aspect-video w-full overflow-hidden rounded-lg relative">
                            {state.detail.banner === null ? (
                                <div className="text-neutral-line flex size-full items-center justify-center">
                                    <ImageOff aria-hidden="true" className="size-6" />
                                    <span className="sr-only">{strings.library.noBanner}</span>
                                </div>
                            ) : (
                                <img
                                    src={state.detail.banner}
                                    alt=""
                                    loading="lazy"
                                    className="size-full object-cover"
                                />
                            )}
                            {state.detail.category === null ? null : (
                                <div>
                                    <ModuleCategoryBadge category={state.detail.category} />
                                </div>
                            )}

                        </div>
                        <div className='bg-gradiend py-4 px-7 w-[75%] mx-auto z-2 min-h-22 text-center flex justify-center items-center rounded-2xl' style={{ marginTop: '-68px' }}>
                            <h3 className="text-card font-display uppercase text-xl font-medium text-white line-clamp-2">{title}</h3>
                        </div>
                        {state.detail.description === '' ? (
                            <p className="text-body text-muted">{strings.materialDetail.noDescription}</p>
                        ) : (
                            <RichText className='p-5' html={state.detail.description} />
                        )}

                    </Card>

                    <Card className="flex flex-col gap-3 p-5">
                        <h2 className="text-section">{strings.materialDetail.sectionLinks}</h2>
                        <MaterialLinkList links={state.detail.linkMaterials} />
                    </Card>

                    <Card className="flex flex-col gap-4 p-5">
                        <h2 className="text-section">{strings.materialDetail.sectionLessons}</h2>

                        {state.detail.chapters.length === 0 ? (
                            <p className="text-body text-muted">{strings.materialDetail.noLessons}</p>
                        ) : (
                            <ol className="flex flex-col gap-4">
                                {state.detail.chapters.map((chapter, index) => (
                                    <li key={chapter.id} className="border-line rounded-card border p-4">
                                        <h3 className="text-card text-ink">
                                            {chapter.title}
                                        </h3>

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
            ) : null}

            <ConfirmDialog
                open={confirmingDelete}
                title={strings.materialDetail.deleteConfirmTitle}
                description={strings.materialDetail.deleteConfirmBody}
                confirmLabel={strings.materialDetail.deleteConfirmAction}
                confirmingLabel={strings.materialDetail.deleting}
                cancelLabel={strings.materialDetail.deleteConfirmCancel}
                isConfirming={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setConfirmingDelete(false)}
            />
        </section>
    );
};

export default MaterialDetail;
