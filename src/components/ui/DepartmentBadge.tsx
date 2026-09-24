import type { DepartmentCode } from '@/types/common';
import { cn } from '@/utils/cn';

interface DepartmentBadgeProps {
    department: DepartmentCode;
    className?: string;
}

/**
 * Chip outline netral yang menyebut department SUMBER sebuah materi.
 * Bukan kategori, bukan status — karena itu tidak diberi warna status.
 */
export const DepartmentBadge = ({ department, className }: DepartmentBadgeProps) => (
    <span
        className={cn(
            'border-neutral-line text-neutral-ink inline-flex items-center rounded border px-1.5 py-0.5',
            'text-[11px] leading-4 font-bold tracking-[0.03em]',
            className,
        )}
    >
        <span className="sr-only">Department </span>
        {department}
    </span>
);
