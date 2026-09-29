export interface LearningModule {
    id: string;
    title: string;
    description: string | null;
    descriptionClean: string | null;
    banner: string | null;
    linkMaterials: string[];
    category: string | null;
}

export interface ModulePagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ModuleListResult {
    items: LearningModule[];
    pagination: ModulePagination;
}

export type ModuleSort = 'latest' | 'title';

export interface ModuleListQuery {
    page: number;
    limit: number;
    search: string;
    sort: ModuleSort;
    category: string | null;
    createdBy: string | null;
}

export type ApiFailureCode = 'validation' | 'unauthorized' | 'offline' | 'unknown';

export type ModuleListOutcome =
    | { ok: true; data: ModuleListResult }
    | { ok: false; code: ApiFailureCode; message?: string };

export interface ModuleChapter {
    id: string;
    title: string;
    description: string;
    linkMaterials: string[];
    line: number;
}

export interface ModuleDetail {
    id: string;
    title: string;
    description: string;
    banner: string | null;
    linkMaterials: string[];
    category: string | null;
    chapters: ModuleChapter[];
}

export type ModuleDetailOutcome =
    | { ok: true; data: ModuleDetail }
    | { ok: false; code: ApiFailureCode | 'not_found'; message?: string };
