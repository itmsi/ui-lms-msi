import { useCallback, useEffect, useRef, useState } from 'react';
import type { SubmitEvent } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import type { SelectOption } from '@/components/ui/Select';
import { strings } from '@/locales/id';
import {
    createMaterial,
    fetchMaterialDetail,
    updateMaterial,
} from '@/pages/Instructor/Materials/services/materialService';
import type {
    MaterialDetailOutcome,
    SaveMaterialOutcome,
} from '@/pages/Instructor/Materials/services/materialService';
import { createMaterialDraft, toMaterialDraft } from '@/pages/Instructor/Materials/types';
import type { DraftErrors, MaterialDraft } from '@/pages/Instructor/Materials/types';

const failureMessage = (outcome: Extract<SaveMaterialOutcome, { ok: false }>): string => {
    if (outcome.code === 'validation' && outcome.message !== undefined) {
        return outcome.message;
    }

    if (outcome.code === 'unauthorized') {
        return strings.materialEditor.saveUnauthorized;
    }

    return outcome.code === 'offline' ? strings.materialEditor.saveOffline : strings.materialEditor.saveFailed;
};

const CATEGORY_OPTIONS: SelectOption[] = [
    { value: 'reguler', label: strings.library.categoryRegular },
    { value: 'mt', label: strings.library.categoryMt },
    { value: 'onboarding', label: strings.library.categoryOnBoard },
];

const DEFAULT_CATEGORY = 'reguler';

const isHttpUrl = (value: string) => /^https?:\/\/\S+$/i.test(value.trim());

const validate = (draft: MaterialDraft): DraftErrors => {
    const errors: DraftErrors = {};

    if (draft.title.trim() === '') {
        errors.title = strings.materialEditor.errorTitleRequired;
    }

    const checkLinks = (links: MaterialDraft['links']) => {
        for (const link of links) {
            if (link.value.trim() !== '' && isHttpUrl(link.value) === false) {
                errors[link.key] = strings.materialEditor.errorLinkInvalid;
            }
        }
    };

    checkLinks(draft.links);

    for (const lesson of draft.lessons) {
        if (lesson.title.trim() === '') {
            errors[lesson.key] = strings.materialEditor.errorLessonTitleRequired;
        }

        checkLinks(lesson.links);
    }

    return errors;
};

type LoadedEditorState =
    | { status: 'ready' }
    | { status: 'error'; code: Extract<MaterialDetailOutcome, { ok: false }>['code']; message?: string };

export type EditorLoadState = { status: 'loading' } | LoadedEditorState;

export const useMaterialEditor = (materialId?: string) => {
    const navigate = useNavigate();

    const [draft, setDraft] = useState<MaterialDraft>(() => createMaterialDraft(DEFAULT_CATEGORY));
    const [errors, setErrors] = useState<DraftErrors>({});

    const [currentBanner, setCurrentBanner] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const queryKey = `${materialId ?? ''}|${String(reloadToken)}`;
    const [loaded, setLoaded] = useState<{ key: string; value: LoadedEditorState } | null>(null);

    const loadState: EditorLoadState =
        materialId === undefined
            ? { status: 'ready' }
            : loaded !== null && loaded.key === queryKey
                ? loaded.value
                : { status: 'loading' };

    useEffect(() => {
        if (materialId === undefined) {
            return;
        }

        const controller = new AbortController();

        const run = async () => {
            const outcome = await fetchMaterialDetail(materialId, controller.signal);

            if (controller.signal.aborted) {
                return;
            }

            if (outcome.ok) {
                setDraft(toMaterialDraft(outcome.data));
                setCurrentBanner(outcome.data.banner);
                setErrors({});
            }

            setLoaded({
                key: queryKey,
                value: outcome.ok
                    ? { status: 'ready' }
                    : { status: 'error', code: outcome.code, message: outcome.message },
            });
        };

        void run();

        return () => {
            controller.abort();
        };
    }, [queryKey, materialId]);

    const retryLoad = useCallback(() => {
        setReloadToken((token) => token + 1);
    }, []);

    const formRef = useRef<HTMLFormElement>(null);
    const [failedAttempt, setFailedAttempt] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (failedAttempt === 0) {
            return;
        }

        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }, [failedAttempt]);

    const update = useCallback((patch: Partial<MaterialDraft>) => {
        setDraft((current) => ({ ...current, ...patch }));
    }, []);

    const setBanner = useCallback((file: File | null, error: string | null) => {
        setDraft((current) => ({ ...current, banner: file }));

        if (error === null) {
            setCurrentBanner(null);
        }

        setErrors((current) => {
            const next = { ...current };

            if (error === null) {
                delete next.banner;
            } else {
                next.banner = error;
            }

            return next;
        });
    }, []);

    const handleSubmit = useCallback(
        (event: SubmitEvent<HTMLFormElement>) => {
            event.preventDefault();

            const nextErrors = validate(draft);
            setErrors(nextErrors);

            if (Object.keys(nextErrors).length > 0) {
                setFailedAttempt((attempt) => attempt + 1);
                toast.error(strings.materialEditor.errorFormInvalid);
                return;
            }

            if (isSubmitting) {
                return;
            }

            setIsSubmitting(true);

            const save = async () => {
                const outcome =
                    materialId === undefined ? await createMaterial(draft) : await updateMaterial(materialId, draft);

                if (outcome.ok) {
                    toast.success(materialId === undefined ? strings.materialEditor.saved : strings.materialEditor.updated);
                    void navigate(materialId === undefined ? '/materials' : `/materials/${materialId}`);
                    return;
                }

                setIsSubmitting(false);
                toast.error(failureMessage(outcome));
            };

            void save();
        },
        [draft, isSubmitting, materialId, navigate],
    );

    const cancel = useCallback(() => {
        void navigate(materialId === undefined ? '/materials' : `/materials/${materialId}`);
    }, [materialId, navigate]);

    return {
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
        categoryOptions: CATEGORY_OPTIONS,
        isEditing: materialId !== undefined,
    };
};
