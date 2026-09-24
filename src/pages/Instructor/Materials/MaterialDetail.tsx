import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

import { ModuleDetailView } from '@/components/patterns/ModuleDetailView';
import PageHeaderDetail from '@/components/patterns/PageHeaderDetail';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ModuleCategoryBadge } from '@/components/ui/ModuleCategoryBadge';
import { useMaterialsAccess } from '@/hooks/useMaterialsAccess';
import { useModuleDetail } from '@/hooks/useModuleDetail';
import { strings } from '@/locales/id';
import { deleteMaterial } from '@/pages/Instructor/Materials/services/materialService';
import type { DeleteMaterialOutcome } from '@/pages/Instructor/Materials/services/materialService';

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
    const { state, retry } = useModuleDetail(id);
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

            {/* Kategori sudah tampil di header, jadi tidak diulang di atas banner. */}
            <ModuleDetailView
                state={state}
                onRetry={retry}
                backTo="/materials"
                backLabel={strings.materialDetail.backToList}
                showCategoryBadge={false}
            />

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
