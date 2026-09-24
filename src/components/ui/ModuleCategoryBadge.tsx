import { strings } from '@/locales/id';
import { cn } from '@/utils/cn';

interface ModuleCategoryBadgeProps {
    /** Nilai `module_category` apa adanya dari API. */
    category: string;
    className?: string;
}

const LABEL_BY_CATEGORY: Record<string, string> = {
    mt: strings.library.categoryMt,
    regular: strings.library.categoryRegular,
};

/**
 * Menandai program materi (MT atau Reguler).
 *
 * Semua kategori memakai perlakuan visual yang sama — tidak ada warna kuat berbeda
 * per program, sesuai aturan design system. Yang membedakan hanya labelnya.
 *
 * Kategori yang belum dikenali tetap ditampilkan apa adanya supaya nilai baru dari
 * backend terlihat, bukan hilang diam-diam.
 */
export const ModuleCategoryBadge = ({ category, className }: ModuleCategoryBadgeProps) => {
    const key = category.trim().toLowerCase();

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border border-white/25 px-2.5 py-1',
                // Latar gelap pekat supaya tetap terbaca di atas banner terang mana pun.
                'bg-ink/80 text-white backdrop-blur-sm',
                'text-[11px] leading-4 font-bold tracking-[0.03em]',
                className,
            )}
        >
            <span className="sr-only">{strings.library.categoryLabel} </span>
            {LABEL_BY_CATEGORY[key] ?? category.toUpperCase()}
        </span>
    );
};
