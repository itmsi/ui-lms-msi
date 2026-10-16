import { readEnvelope } from '@/helpers/apiEnvelope';
import { API_UPLOAD_TIMEOUT_MS } from '@/helpers/apiConfig';
import { apiPost } from '@/helpers/apiHelper';
import { isRecord } from '@/helpers/authParsers';
import { toApiFailureCode, toPagination } from '@/services/moduleService';
import type {
    ActivityExportOutcome,
    ActivityExportQuery,
    ActivityListOutcome,
    ActivityListQuery,
    ActivityLog,
} from '@/types/activity';

const CREATE_PATH = 'log-activity/create';
const LIST_PATH = 'log-activity/get';
const EXPORT_PATH = 'log-activity/export';

export interface ActivityEntry {
    createdBy: string;
    modulesId: string | null;
    activity: string;
    fileName: string | null;
    fileLink: string | null;
    type: string | null;
}

export const logActivity = (entry: ActivityEntry): void => {
    if (navigator.onLine === false) {
        return;
    }

    apiPost<unknown>(CREATE_PATH, {
        created_by: entry.createdBy,
        modules_id: entry.modulesId,
        activity: entry.activity,
        file_name: entry.fileName,
        file_link: entry.fileLink,
        type: entry.type,
    }).catch(() => undefined);
};

const readString = (value: unknown): string | null => (typeof value === 'string' && value !== '' ? value : null);

const isHttpUrl = (value: string | null): value is string => value !== null && /^https?:\/\//i.test(value);

const toActivityLog = (value: unknown): ActivityLog | null => {
    if (isRecord(value) === false || typeof value.id !== 'string' || typeof value.created_at !== 'string') {
        return null;
    }

    const fileName = readString(value.file_name);
    const fileLink = readString(value.file_link);
    const isLegacyLink = fileLink === null && isHttpUrl(fileName);

    return {
        id: value.id,
        moduleId: readString(value.modules_id),
        activity: readString(value.activity) ?? '',
        fileName: isLegacyLink ? null : fileName,
        fileLink: isLegacyLink ? fileName : fileLink,
        type: readString(value.type),
        createdAt: value.created_at,
        createdBy: readString(value.created_by),
        createdByName: readString(value.created_by_name),
        moduleTitle: readString(value.modul_title),
    };
};

export const fetchActivities = async (
    query: ActivityListQuery,
    signal?: AbortSignal,
): Promise<ActivityListOutcome> => {
    if (navigator.onLine === false) {
        return { ok: false, code: 'offline' };
    }

    try {
        const { data: body } = await apiPost<unknown>(
            LIST_PATH,
            {
                page: query.page,
                limit: query.limit,
                sort_by: 'created_at',
                sort_order: 'desc',
                search: query.search,
                modules_id: query.moduleId ?? '',
                ...(query.employeeId === null ? {} : { employee_id: query.employeeId }),
                ...(query.dateRange === undefined ? {} : { start_date: query.dateRange.start, end_date: query.dateRange.end }),
            },
            { signal },
        );

        const envelope = readEnvelope(body);

        if (envelope.ok === false) {
            return envelope.message === null
                ? { ok: false, code: 'unknown' }
                : { ok: false, code: 'validation', message: envelope.message };
        }

        const payload = isRecord(envelope.data) ? envelope.data : {};
        const rawItems = Array.isArray(payload.items) ? (payload.items as unknown[]) : [];

        return {
            ok: true,
            data: {
                items: rawItems.map(toActivityLog).filter((item): item is ActivityLog => item !== null),
                pagination: toPagination(payload.pagination, query),
            },
        };
    } catch (error) {
        return { ok: false, code: toApiFailureCode(error) };
    }
};

const toHttpsUrl = (value: unknown): string | null => {
    if (typeof value !== 'string') {
        return null;
    }

    try {
        const url = new URL(value);

        return url.protocol === 'https:' ? url.href : null;
    } catch {
        return null;
    }
};

export const exportActivities = async (query: ActivityExportQuery): Promise<ActivityExportOutcome> => {
    if (navigator.onLine === false) {
        return { ok: false, code: 'offline' };
    }

    try {
        const { data: body } = await apiPost<unknown>(
            EXPORT_PATH,
            {
                sort_by: 'created_at',
                sort_order: 'desc',
                modules_id: query.moduleId,
                employee_id: query.employeeId,
                start_date: query.dateRange.start,
                end_date: query.dateRange.end,
            },
            { timeout: API_UPLOAD_TIMEOUT_MS },
        );

        const envelope = readEnvelope(body);

        if (envelope.ok === false) {
            return envelope.message === null
                ? { ok: false, code: 'unknown' }
                : { ok: false, code: 'validation', message: envelope.message };
        }

        const payload = isRecord(envelope.data) ? envelope.data : {};
        const url = toHttpsUrl(payload.url);

        if (url === null) {
            return { ok: false, code: 'unknown' };
        }

        return {
            ok: true,
            data: {
                url,
                fileName: readString(payload.file_name),
                total: typeof payload.total === 'number' && Number.isFinite(payload.total) ? payload.total : null,
            },
        };
    } catch (error) {
        return { ok: false, code: toApiFailureCode(error) };
    }
};
