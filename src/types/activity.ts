import type { DateRange } from '@/types/dateRange';
import type { ApiFailureCode, ModulePagination } from '@/types/module';

export type ActivityKind = 'track' | 'module' | 'lesson' | 'link' | 'other';

export interface ActivityLog {
    id: string;
    moduleId: string | null;
    activity: string;
    fileName: string | null;
    fileLink: string | null;
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

export interface ActivityExportQuery {
    moduleId: string | null;
    employeeId: string | null;
    dateRange: DateRange;
}

export interface ActivityExportFile {
    url: string;
    fileName: string | null;
    total: number | null;
}

export type ActivityExportOutcome =
    | { ok: true; data: ActivityExportFile }
    | { ok: false; code: ApiFailureCode; message?: string };

export type ActivityListOutcome =
    | { ok: true; data: ActivityListResult }
    | { ok: false; code: ApiFailureCode; message?: string };
