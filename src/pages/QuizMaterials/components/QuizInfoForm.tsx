import { ArrowRight } from 'lucide-react';
import type { SubmitEvent } from 'react';

import { BannerField } from '@/components/patterns/BannerField';
import { DateRangePickerField } from '@/components/patterns/DateRangePickerField';
import FormActions from '@/components/patterns/FormActions';
import { MateriSelect } from '@/components/patterns/MateriSelect';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { strings } from '@/locales/id';
import { QuizAudienceField } from '@/pages/QuizMaterials/components/QuizAudienceField';
import type { QuizInfo, QuizInfoErrors, QuizInfoField } from '@/pages/QuizMaterials/types';
import { cn } from '@/utils/cn';

interface QuizInfoFormProps {
    mode: 'create' | 'edit';
    info: QuizInfo;
    errors: QuizInfoErrors;
    minDate: string;
    currentBannerUrl?: string | null;
    isSubmitting: boolean;
    onChange: <K extends QuizInfoField>(field: K, value: QuizInfo[K]) => void;
    onChangeBanner: (file: File | null, error: string | null) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

export const QuizInfoForm = ({
    mode,
    info,
    errors,
    minDate,
    currentBannerUrl = null,
    isSubmitting,
    onChange,
    onChangeBanner,
    onSubmit,
    onCancel,
}: QuizInfoFormProps) => {
    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <Card className="flex flex-col gap-5 p-5">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-section">{strings.quizForm.sectionInfo}</h2>
                    <p className="text-caption text-muted">{strings.quizForm.sectionInfoHint}</p>
                </div>

                <Input
                    label={strings.quizForm.titleLabel}
                    required
                    value={info.title}
                    placeholder={strings.quizForm.titlePlaceholder}
                    hint={strings.quizForm.titleHint}
                    error={errors.title}
                    onChange={(event) => onChange('title', event.target.value)}
                />

                <div className="flex flex-col gap-1.5">
                    <span aria-hidden="true" className="text-body text-ink font-medium">
                        {strings.quizForm.moduleLabel}
                        <span className="text-danger-ink"> *</span>
                    </span>
                    <div className={cn('rounded-card', errors.module !== undefined && 'ring-danger ring-1')}>
                        <MateriSelect
                            value={info.module?.id ?? null}
                            selected={info.module}
                            onChange={(material) => onChange('module', material)}
                            label={strings.quizForm.moduleLabel}
                            placeholder={strings.quizForm.modulePlaceholder}
                        />
                    </div>
                    {errors.module === undefined ? (
                        <p className="text-caption text-muted">{strings.quizForm.moduleHint}</p>
                    ) : (
                        <p role="alert" className="text-caption text-danger-ink">
                            {errors.module}
                        </p>
                    )}
                </div>

                <QuizAudienceField
                    value={info.audiences}
                    onChange={(audiences) => onChange('audiences', audiences)}
                    error={errors.audiences}
                />

                <DateRangePickerField
                    label={strings.quizForm.periodLabel}
                    required
                    value={info.period}
                    onChange={(period) => onChange('period', period)}
                    min={minDate}
                    placeholder={strings.quizForm.periodPlaceholder}
                    error={errors.period}
                    className="sm:max-w-sm"
                />

                <BannerField file={info.banner} error={errors.banner} currentUrl={currentBannerUrl} required onChange={onChangeBanner} />
            </Card>

            <FormActions
                submitLabel={mode === 'create' ? strings.quizForm.saveAndContinue : strings.quizForm.saveChanges}
                submittingLabel={strings.quizForm.savingInfo}
                cancelLabel={strings.quizForm.cancel}
                onCancel={onCancel}
                isSubmitting={isSubmitting}
                submitIcon={mode === 'create' ? <ArrowRight aria-hidden="true" className="size-4" /> : undefined}
            />
        </form>
    );
};
