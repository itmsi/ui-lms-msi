import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { strings } from '@/locales/id';
import type { QuizPayload, SaveFailure } from '@/pages/QuizMaterials/services/quizMaterialService';
import type { QuizInfo, QuizInfoErrors, QuizInfoField } from '@/pages/QuizMaterials/types';
import { toFailureMessage } from '@/utils/failureMessage';
import type { FailureMessages } from '@/utils/failureMessage';

export const EMPTY_QUIZ_INFO: QuizInfo = { title: '', module: null, audiences: [], period: null, banner: null };

const validate = (info: QuizInfo, today: string, keptStart: string | null, hasCurrentBanner: boolean): QuizInfoErrors => {
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
    } else if (info.period.start < today && info.period.start !== keptStart) {
        errors.period = strings.quizForm.errorPeriodPast;
    }

    if (info.banner === null && hasCurrentBanner === false) {
        errors.banner = strings.quizForm.errorBannerRequired;
    }

    return errors;
};

const isSameInfo = (left: QuizInfo, right: QuizInfo): boolean =>
    left.title.trim() === right.title.trim() &&
    left.module?.id === right.module?.id &&
    left.audiences.join() === right.audiences.join() &&
    left.period?.start === right.period?.start &&
    left.period?.end === right.period?.end &&
    left.banner === right.banner;

const SAVE_MESSAGES: FailureMessages = {
    unauthorized: strings.quizForm.saveUnauthorized,
    offline: strings.quizForm.saveOffline,
    fallback: strings.quizForm.saveFailed,
};

interface QuizDraftOptions<T> {
    today: string;
    initial: QuizInfo;
    hasCurrentBanner?: boolean;
    save: (payload: QuizPayload) => Promise<{ ok: true; data: T } | SaveFailure>;
    successMessage: string;
    onSaved: (result: T, info: QuizInfo) => void;
}

export const useQuizDraft = <T>({ today, initial, hasCurrentBanner = false, save, successMessage, onSaved }: QuizDraftOptions<T>) => {
    const [info, setInfo] = useState<QuizInfo>(initial);
    const [errors, setErrors] = useState<QuizInfoErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submittingRef = useRef(false);
    const keptStart = initial.period?.start ?? null;

    const update = useCallback(<K extends QuizInfoField>(field: K, value: QuizInfo[K]) => {
        setInfo((current) => ({ ...current, [field]: value }));
        setErrors((current) => (current[field] === undefined ? current : { ...current, [field]: undefined }));
    }, []);

    const setBanner = useCallback((file: File | null, error: string | null) => {
        setInfo((current) => ({ ...current, banner: file }));
        setErrors((current) => ({ ...current, banner: error ?? undefined }));
    }, []);

    const submit = useCallback(async () => {
        if (submittingRef.current) {
            return;
        }

        const nextErrors = validate(info, today, keptStart, hasCurrentBanner);

        setErrors(nextErrors);

        if (info.module === null || info.period === null || Object.keys(nextErrors).length > 0) {
            return;
        }

        submittingRef.current = true;
        setIsSubmitting(true);

        const outcome = await save({
            title: info.title.trim(),
            moduleId: info.module.id,
            audiences: info.audiences,
            start: info.period.start,
            end: info.period.end,
            banner: info.banner,
        });

        if (outcome.ok) {
            toast.success(successMessage);
            onSaved(outcome.data, info);
            return;
        }

        submittingRef.current = false;
        setIsSubmitting(false);
        toast.error(toFailureMessage(outcome, SAVE_MESSAGES));
    }, [hasCurrentBanner, info, keptStart, onSaved, save, successMessage, today]);

    return { info, errors, isSubmitting, update, setBanner, submit, isDirty: isSameInfo(info, initial) === false };
};
