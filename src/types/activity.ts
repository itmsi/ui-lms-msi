import type { DateRange } from '@/types/dateRange';
import type { ApiFailureCode, ModulePagination } from '@/types/module';

export type ActivityKind = 'track' | 'module' | 'lesson' | 'link' | 'other';

export interface ActivityLog {
    id: string;
    moduleId: string | null;
    activity: string;
    fileName: string | null;
    type: string | null;
    createdAt: string;
    createdBy: string | null;
    createdByName: string | null;
    moduleTitle: string | null;
}

export interface ActivityListResult {
    items: ActivityLog[];
    pagination: ModulePagination;
}

export interface ActivityListQuery {
    page: number;
    limit: number;
    search: string;
    moduleId: string | null;
    employeeId: string | null;
    dateRange?: DateRange;
}

export type ActivityListOutcome =
    | { ok: true; data: ActivityListResult }
    | { ok: false; code: ApiFailureCode; message?: string };
