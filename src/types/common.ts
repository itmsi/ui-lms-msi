export const DEPARTMENT_CODES = ['ITI', 'MSI', 'MSO', 'IEL', 'IEC'] as const;

export type DepartmentCode = (typeof DEPARTMENT_CODES)[number];

export type LearningStatus =
    | 'completed'
    | 'in_progress'
    | 'not_started'
    | 'locked'
    | 'overdue'
    | 'under_review'
    | 'needs_revision'
    | 'approved';

export type LessonFormat = 'text' | 'video' | 'audio' | 'file';

export const MENU_PERMISSIONS = ['read', 'create', 'update', 'delete'] as const;

export type MenuPermission = (typeof MENU_PERMISSIONS)[number];
