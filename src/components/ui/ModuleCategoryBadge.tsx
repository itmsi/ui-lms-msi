import { strings } from '@/locales/id';
import { cn } from '@/utils/cn';

interface ModuleCategoryBadgeProps {
    category: string;
    className?: string;
}

type CategoryTone = 'mt' | 'reguler';

const TONE_BY_CATEGORY: Record<string, CategoryTone> = {
    mt: 'mt',
    reguler: 'reguler',
    regular: 'reguler',
};

const LABEL_BY_TONE: Record<CategoryTone, string> = {
    mt: strings.library.categoryMt,
    reguler: strings.library.categoryRegular,
};

const TONE_CLASS: Record<CategoryTone, string> = {
    mt: 'bg-warning-soft border-warning/50 text-warning-ink',
    reguler: 'bg-surface border-primary/40 text-primary-dark',
};

const UNKNOWN_CLASS = 'bg-neutral-soft border-neutral-line text-neutral-ink';

export const ModuleCategoryBadge = ({ category, className }: ModuleCategoryBadgeProps) => {
    const tone = TONE_BY_CATEGORY[category.trim().toLowerCase()];

    return (
        <span
            className={cn(
                'inline-flex min-w-18 shrink-0 items-center justify-center rounded-full border px-2.5 py-1',
                'text-[11px] leading-4 font-bold tracking-[0.03em]',
                tone === undefined ? UNKNOWN_CLASS : TONE_CLASS[tone],
                className,
            )}
        >
            <span className="sr-only">{strings.library.categoryLabel} </span>
            {tone === undefined ? category.toUpperCase() : LABEL_BY_TONE[tone]}
        </span>
    );
};
