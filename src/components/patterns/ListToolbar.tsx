import type { ReactNode } from 'react';

import { strings } from '@/locales/id';
import type { ModuleSort } from '@/types/module';
import { cn } from '@/utils/cn';

interface ListToolbarProps {
    title: string;
    /** null selama data belum tersedia, supaya jumlahnya tidak berkedip dari 0. */
    total: number | null;
    sort: ModuleSort;
    onSelectSort: (sort: ModuleSort) => void;
    disabled: boolean;
    /** Aksi di sisi kanan, misalnya tombol buat baru. */
    action?: ReactNode;
}

const SORT_OPTIONS: { value: ModuleSort; label: string }[] = [
    { value: 'latest', label: strings.library.sortLatest },
    { value: 'title', label: strings.library.sortAlphabetical },
];

/**
 * Judul seksi dan jumlah hasil di kiri, pengurutan di kanan — mengikuti urutan
 * prioritas baca: pengguna tahu dulu sedang melihat apa dan berapa banyak, baru
 * cara menyusunnya.
 */
export const ListToolbar = ({ title, total, sort, onSelectSort, disabled, action }: ListToolbarProps) => (
    <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
            <h2 className="text-section">{title}</h2>
            <p aria-live="polite" className="text-caption text-muted tabular-nums">
                {total === null ? ' ' : `${String(total)} ${strings.library.availableSuffix}`}
            </p>
        </div>

        <div className="flex items-center gap-2">
            <span className="text-caption text-muted hidden sm:inline">{strings.library.sortLabel}</span>

            <div className="border-line bg-surface flex items-center gap-1 rounded-full border p-1">
                {SORT_OPTIONS.map((option) => {
                    const isActive = sort === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={isActive}
                            disabled={disabled}
                            onClick={() => onSelectSort(option.value)}
                            className={cn(
                                'text-caption rounded-full px-3 py-1.5 font-medium transition-colors',
                                'disabled:cursor-not-allowed disabled:opacity-60',
                                isActive
                                    ? 'bg-primary-light text-primary-dark'
                                    : 'text-muted hover:bg-neutral-soft hover:text-ink',
                            )}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>

            {action}
        </div>
    </div>
);
