import type { ApiFailureCode, ModulePagination } from '@/types/module';

export interface Employee {
    id: string;
    name: string;
    email: string | null;
    title: string | null;
    department: string | null;
    company: string | null;
    group: string | null;
}

export interface EmployeeListResult {
    items: Employee[];
    pagination: ModulePagination;
}

export interface EmployeeListQuery {
    page: number;
    limit: number;
    search: string;
}

export type EmployeeListOutcome =
    | { ok: true; data: EmployeeListResult }
    | { ok: false; code: ApiFailureCode; message?: string };

export type EmployeeLookupOutcome =
    | { ok: true; data: Employee | null }
    | { ok: false; code: ApiFailureCode; message?: string };
