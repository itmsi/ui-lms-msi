/** Kode department yang dipakai perusahaan. Bukan kategori materi, melainkan sumbernya. */
export const DEPARTMENT_CODES = ['ITI', 'MSI', 'MSO', 'IEL', 'IEC'] as const;

export type DepartmentCode = (typeof DEPARTMENT_CODES)[number];

/** Status yang dipakai StatusBadge di seluruh aplikasi. */
export type LearningStatus =
    | 'completed'
    | 'in_progress'
    | 'not_started'
    | 'locked'
    | 'overdue'
    | 'under_review'
    | 'needs_revision'
    | 'approved';

/** Format konten lesson. Video/audio/file selalu berupa lampiran WeDrive, bukan player. */
export type LessonFormat = 'text' | 'video' | 'audio' | 'file';

/** Verba izin yang dikirim backend per item menu. */
export const MENU_PERMISSIONS = ['read', 'create', 'update', 'delete'] as const;

export type MenuPermission = (typeof MENU_PERMISSIONS)[number];
