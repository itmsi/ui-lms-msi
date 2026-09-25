import { readEnvelope } from '@/helpers/apiEnvelope';
import { apiDelete, apiPostMultipart, apiPutMultipart } from '@/helpers/apiHelper';
import { isRecord } from '@/helpers/authParsers';
import type { LinkDraft, MaterialDraft } from '@/pages/Instructor/Materials/types';
import { fetchModuleDetail, toApiFailureCode } from '@/services/moduleService';
import type { ApiFailureCode, ModuleDetailOutcome } from '@/types/module';
import { toDescriptionExcerpt } from '@/utils/htmlText';

const CREATE_PATH = 'modules/create-all';
const updatePath = (id: string) => `modules/update-all/${encodeURIComponent(id)}`;
const deletePath = (id: string) => `modules/delete-all/${encodeURIComponent(id)}`;

export type SaveMaterialOutcome =
    | { ok: true; id: string | null }
    | { ok: false; code: ApiFailureCode; message?: string };

export type DeleteMaterialOutcome = { ok: true } | { ok: false; code: ApiFailureCode; message?: string };

interface ChapterPayload {
    id: string;
    line: number;
    title: string;
    description: string;
    link_materials: string[];
}

const toLinkValues = (links: LinkDraft[]): string[] =>
    links.map((link) => link.value.trim()).filter((value) => value !== '');

const buildFormData = (draft: MaterialDraft): FormData => {
    const form = new FormData();

    form.append('title', draft.title.trim());
    form.append('module_category', draft.category);

    if (draft.description !== '') {
        form.append('description', draft.description);
        form.append('description_clean', toDescriptionExcerpt(draft.description));
    }

    const links = toLinkValues(draft.links);

    if (links.length > 0) {
        form.append('link_materials', links.join(','));
    }

    if (draft.banner !== null) {
        form.append('banner', draft.banner);
    }

    const chapters: ChapterPayload[] = draft.lessons.map((lesson, index) => ({
        id: lesson.id,
        line: index + 1,
        title: lesson.title.trim(),
        description: lesson.description,
        link_materials: toLinkValues(lesson.links),
    }));

    if (chapters.length > 0) {
        form.append('chapters', JSON.stringify(chapters));
    }

    return form;
};

export type MaterialDetailOutcome = ModuleDetailOutcome;
export const fetchMaterialDetail = fetchModuleDetail;

const saveMaterial = async (
    send: () => Promise<{ data: unknown }>,
): Promise<SaveMaterialOutcome> => {
    if (navigator.onLine === false) {
        return { ok: false, code: 'offline' };
    }

    try {
        const { data: body } = await send();
        const envelope = readEnvelope(body);

        if (envelope.ok === false) {
            return envelope.message === null
                ? { ok: false, code: 'unknown' }
                : { ok: false, code: 'validation', message: envelope.message };
        }

        const saved = isRecord(envelope.data) ? envelope.data : {};

        return { ok: true, id: typeof saved.id === 'string' ? saved.id : null };
    } catch (error) {
        return { ok: false, code: toApiFailureCode(error) };
    }
};

export const createMaterial = (draft: MaterialDraft): Promise<SaveMaterialOutcome> =>
    saveMaterial(() => apiPostMultipart<unknown>(CREATE_PATH, buildFormData(draft)));

export const updateMaterial = (id: string, draft: MaterialDraft): Promise<SaveMaterialOutcome> =>
    saveMaterial(() => apiPutMultipart<unknown>(updatePath(id), buildFormData(draft)));

export const deleteMaterial = async (id: string): Promise<DeleteMaterialOutcome> => {
    if (navigator.onLine === false) {
        return { ok: false, code: 'offline' };
    }

    try {
        const { data: body } = await apiDelete<unknown>(deletePath(id));
        const envelope = readEnvelope(body);

        if (envelope.ok === false) {
            return envelope.message === null
                ? { ok: false, code: 'unknown' }
                : { ok: false, code: 'validation', message: envelope.message };
        }

        return { ok: true };
    } catch (error) {
        return { ok: false, code: toApiFailureCode(error) };
    }
};
