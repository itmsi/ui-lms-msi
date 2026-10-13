import { readEnvelope } from '@/helpers/apiEnvelope';
import { apiPost } from '@/helpers/apiHelper';
import { isRecord } from '@/helpers/authParsers';
import { toApiFailureCode, toPagination } from '@/services/moduleService';
import type { ActivityListOutcome, ActivityListQuery, ActivityLog } from '@/types/activity';

const CREATE_PATH = 'log-activity/create';
const LIST_PATH = 'log-activity/get';

export interface ActivityEntry {
    createdBy: string;
    modulesId: string | null;
    activity: string;
    fileName: string | null;
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
        type: entry.type,
    }).catch(() => undefined);
};

const readString = (value: unknown): string | null => (typeof value === 'string' && value !== '' ? value : null);

const toActivityLog = (value: unknown): ActivityLog | null => {
    if (isRecord(value) === false || typeof value.id !== 'string' || typeof value.created_at !== 'string') {
        return null;
    }

    return {
        id: value.id,
        moduleId: readString(value.modules_id),
        activity: readString(value.activity) ?? '',
        fileName: readString(value.file_name),
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
