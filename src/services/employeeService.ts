import { readEnvelope } from '@/helpers/apiEnvelope';
import { apiGatewayPost } from '@/helpers/apiHelper';
import { isRecord } from '@/helpers/authParsers';
import { toApiFailureCode, toPagination } from '@/services/moduleService';
import type { Employee, EmployeeListOutcome, EmployeeListQuery, EmployeeLookupOutcome } from '@/types/employee';

const LIST_PATH = 'employees/get';
const LOOKUP_LIMIT = 10;

const readString = (value: unknown): string | null => (typeof value === 'string' && value !== '' ? value : null);

const toEmployee = (value: unknown): Employee | null => {
    if (isRecord(value) === false || typeof value.employee_id !== 'string') {
        return null;
    }

    return {
        id: value.employee_id,
        name: readString(value.employee_name) ?? value.employee_id,
        email: readString(value.employee_email),
        title: readString(value.title_name),
        department: readString(value.department_name),
        company: readString(value.company_name),
        group: readString(value.group_name),
    };
};

const postEmployees = async (
    body: Record<string, unknown>,
    fallback: { page: number; limit: number },
    signal?: AbortSignal,
): Promise<EmployeeListOutcome> => {
    if (navigator.onLine === false) {
        return { ok: false, code: 'offline' };
    }

    try {
        const { data: response } = await apiGatewayPost<unknown>(LIST_PATH, body, { signal });
        const envelope = readEnvelope(response);

        if (envelope.ok === false) {
            return envelope.message === null
                ? { ok: false, code: 'unknown' }
                : { ok: false, code: 'validation', message: envelope.message };
        }

        const payload = isRecord(envelope.data) ? envelope.data : {};
        const rawItems = Array.isArray(payload.data) ? (payload.data as unknown[]) : [];

        return {
            ok: true,
            data: {
                items: rawItems.map(toEmployee).filter((item): item is Employee => item !== null),
                pagination: toPagination(payload.pagination, fallback),
            },
        };
    } catch (error) {
        return { ok: false, code: toApiFailureCode(error) };
    }
};

export const fetchEmployees = (query: EmployeeListQuery, signal?: AbortSignal): Promise<EmployeeListOutcome> =>
    postEmployees(
        {
            page: query.page,
            limit: query.limit,
            search: query.search,
            sort_by: 'employee_name',
            sort_order: 'asc',
            employee_status: 'active',
        },
        query,
        signal,
    );

export const fetchEmployeeById = async (id: string, signal?: AbortSignal): Promise<EmployeeLookupOutcome> => {
    const outcome = await postEmployees(
        { page: 1, limit: LOOKUP_LIMIT, search: id, sort_by: 'employee_name', sort_order: 'asc' },
        { page: 1, limit: LOOKUP_LIMIT },
        signal,
    );

    return outcome.ok ? { ok: true, data: outcome.data.items.find((item) => item.id === id) ?? null } : outcome;
};
