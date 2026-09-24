import { useParams } from 'react-router-dom';

import PageHeaderDetail from '@/components/patterns/PageHeaderDetail';
import { PermissionDenied } from '@/components/patterns/PermissionDenied';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Select } from '@/components/ui/Select';
import { useMaterialsAccess } from '@/hooks/useMaterialsAccess';
import { strings } from '@/locales/id';
import { BannerField } from '@/pages/Instructor/Materials/components/BannerField';
import { LessonListField } from '@/pages/Instructor/Materials/components/LessonListField';
import { LinkListField } from '@/pages/Instructor/Materials/components/LinkListField';
import { useMaterialEditor } from '@/pages/Instructor/Materials/hooks/useMaterialEditor';
import FormActions from '@/components/patterns/FormActions';

export const MaterialEditor = () => {
    const { id } = useParams<{ id: string }>();
    const {
        draft,
        errors,
        formRef,
        isSubmitting,
        loadState,
        retryLoad,
        currentBanner,
        update,
        setBanner,
        handleSubmit,
        cancel,
        categoryOptions,
        isEditing,
    } = useMaterialEditor(id);
    const { canCreate, canUpdate } = useMaterialsAccess();

    const hasAccess = isEditing ? canUpdate : canCreate;
    const permissionMessage = isEditing ? strings.permission.updateMaterial : strings.permission.createMaterial;

    return (
        <section className="flex flex-col gap-5">
            <PageHeaderDetail
                title={isEditing ? strings.materialEditor.editTitle : strings.materialEditor.createTitle}
                backPath={isEditing && id !== undefined ? `/materials/${id}` : '/materials'}
                subtitle={isEditing ? strings.materialEditor.editSubtitle : strings.materialEditor.createSubtitle}
            />

            {hasAccess === false ? <PermissionDenied description={permissionMessage} /> : null}

            {hasAccess === true && loadState.status === 'loading' ? (
                <Card className="flex flex-col gap-4 p-5">
                    <LoadingBlock label={strings.common.loading} className="flex flex-col gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-10 w-1/3" />
                    </LoadingBlock>
                </Card>
            ) : null}

            {hasAccess === true && loadState.status === 'error' ? (
                <Card>
                    <ErrorState
                        title={strings.materialDetail.unauthorizedTitle}
                        whatHappened={strings.apiErrors.unauthorizedHappened}
                        whatYouCanDo={strings.apiErrors.unauthorizedDo}
                        whatIsNext={strings.apiErrors.unauthorizedNext}
                        onRetry={retryLoad}
                    />
                </Card>
            ) : null}

            {hasAccess === true && loadState.status === 'ready' ? (
                <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                    <Card className="flex flex-col gap-5 p-5">
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-section">{strings.materialEditor.sectionInfo}</h2>
                            <p className="text-caption text-muted">{strings.materialEditor.sectionInfoHint}</p>
                        </div>

                        <Input
                            label={strings.materialEditor.titleLabel}
                            required
                            value={draft.title}
                            placeholder={strings.materialEditor.titlePlaceholder}
                            error={errors.title}
                            onChange={(event) => update({ title: event.target.value })}
                        />

                        <RichTextEditor
                            label={strings.materialEditor.descriptionLabel}
                            value={draft.description}
                            onChange={(description) => update({ description })}
                        />

                        <Select
                            label={strings.materialEditor.categoryLabel}
                            options={categoryOptions}
                            value={draft.category}
                            onChange={(event) => update({ category: event.target.value })}
                            className="max-w-xs"
                        />

                        <BannerField
                            file={draft.banner}
                            error={errors.banner}
                            currentUrl={currentBanner}
                            onChange={setBanner}
                        />
                    </Card>

                    <Card className="flex flex-col gap-3 p-5">
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-section">{strings.materialEditor.sectionLinks}</h2>
                            <p className="text-caption text-muted">{strings.materialEditor.sectionLinksHint}</p>
                        </div>

                        <LinkListField
                            links={draft.links}
                            errors={errors}
                            onChange={(links) => update({ links })}
                            emptyText={strings.materialEditor.linksEmpty}
                        />
                    </Card>

                    <Card className="flex flex-col gap-3 p-5">
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-section">{strings.materialEditor.sectionLessons}</h2>
                            <p className="text-caption text-muted">{strings.materialEditor.sectionLessonsHint}</p>
                        </div>

                        <LessonListField
                            lessons={draft.lessons}
                            errors={errors}
                            onChange={(lessons) => update({ lessons })}
                        />
                    </Card>

                    <FormActions
                        submitLabel={strings.materialEditor.save}
                        submittingLabel={strings.materialEditor.saving}
                        cancelLabel={strings.materialEditor.cancel}
                        onCancel={cancel}
                        isSubmitting={isSubmitting}
                    />
                </form>
            ) : null}
        </section>
    );
};

export default MaterialEditor;
