import { useCallback, useState } from 'react';

import { strings } from '@/locales/id';
import type { QuizInfo, QuizInfoErrors, QuizInfoField, QuizStep } from '@/pages/QuizMaterials/types';

const EMPTY_INFO: QuizInfo = { title: '', module: null, audiences: [], period: null };

const validate = (info: QuizInfo, today: string): QuizInfoErrors => {
    const errors: QuizInfoErrors = {};

    if (info.title.trim() === '') {
        errors.title = strings.quizForm.errorTitleRequired;
    }

    if (info.module === null) {
        errors.module = strings.quizForm.errorModuleRequired;
    }

    if (info.audiences.length === 0) {
        errors.audiences = strings.quizForm.errorAudienceRequired;
    }

    if (info.period === null) {
        errors.period = strings.quizForm.errorPeriodRequired;
    } else if (info.period.start < today) {
        errors.period = strings.quizForm.errorPeriodPast;
    }

    return errors;
};

export const useQuizDraft = (today: string) => {
    const [info, setInfo] = useState<QuizInfo>(EMPTY_INFO);
    const [errors, setErrors] = useState<QuizInfoErrors>({});
    const [step, setStep] = useState<QuizStep>('info');

    const update = useCallback(<K extends QuizInfoField>(field: K, value: QuizInfo[K]) => {
        setInfo((current) => ({ ...current, [field]: value }));
        setErrors((current) => (current[field] === undefined ? current : { ...current, [field]: undefined }));
    }, []);

    const continueToContent = useCallback((): boolean => {
        const nextErrors = validate(info, today);

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return false;
        }

        setStep('content');

        return true;
    }, [info, today]);

    const editInfo = useCallback(() => setStep('info'), []);

    const isDirty = info.title.trim() !== '' || info.module !== null || info.audiences.length > 0 || info.period !== null;

    return { info, errors, step, update, continueToContent, editInfo, isDirty };
};
