import { ChevronDown, RotateCcw, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { strings } from '@/locales/id';
import { cn } from '@/utils/cn';

export interface AsyncComboboxSource<T> {
    items: T[];
    total: number | null;
    isLoading: boolean;
    failed: boolean;
    hasMore: boolean;
    loadMore: () => void;
    retry: () => void;
}

export interface AsyncComboboxTexts {
    label: string;
    placeholder: string;
    clear: string;
    empty: string;
    failed: string;
    count: (shown: number, total: number) => string;
}

interface AsyncComboboxProps<T> {
    source: AsyncComboboxSource<T>;
    query: string;
    onQueryChange: (query: string) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedKey: string | null;
    selectedLabel: string;
    getKey: (item: T) => string;
    renderOption: (item: T, query: string) => ReactNode;
    onSelect: (item: T | null) => void;
    texts: AsyncComboboxTexts;
    leadingIcon?: ReactNode;
    className?: string;
}

export const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
    const index = query === '' ? -1 : text.toLowerCase().indexOf(query.toLowerCase());

    if (index === -1) {
        return <>{text}</>;
    }

    return (
        <>
            {text.slice(0, index)}
            <mark className="text-primary-dark bg-primary-light rounded-sm">{text.slice(index, index + query.length)}</mark>
            {text.slice(index + query.length)}
        </>
    );
};

const preventBlur = (event: { preventDefault: () => void }) => event.preventDefault();

const LOAD_MORE_MARGIN = '0px 0px 120px 0px';

export const AsyncCombobox = <T,>({
    source,
    query,
    onQueryChange,
    open,
    onOpenChange,
    selectedKey,
    selectedLabel,
    getKey,
    renderOption,
    onSelect,
    texts,
    leadingIcon,
    className,
}: AsyncComboboxProps<T>) => {
    const [activeIndex, setActiveIndex] = useState(-1);
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const sentinelRef = useRef<HTMLLIElement>(null);
    const listId = useId();
    const labelId = useId();

    const { loadMore } = source;
    const canLoadMore = open && source.hasMore && source.isLoading === false && source.failed === false;

    useEffect(() => {
        const root = listRef.current;
        const sentinel = sentinelRef.current;

        if (canLoadMore === false || root === null || sentinel === null) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    loadMore();
                }
            },
            { root, rootMargin: LOAD_MORE_MARGIN },
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [canLoadMore, loadMore]);

    useEffect(() => {
        if (open && activeIndex >= 0) {
            listRef.current?.children.item(activeIndex)?.scrollIntoView({ block: 'nearest' });
        }
    }, [open, activeIndex]);

    useEffect(() => {
        if (open === false) {
            return;
        }

        const closeOnOutside = (event: MouseEvent) => {
            if (rootRef.current !== null && event.target instanceof Node && rootRef.current.contains(event.target) === false) {
                onOpenChange(false);
            }
        };

        document.addEventListener('mousedown', closeOnOutside);

        return () => {
            document.removeEventListener('mousedown', closeOnOutside);
        };
    }, [open, onOpenChange]);

    const openList = () => {
        onQueryChange('');
        setActiveIndex(-1);
        onOpenChange(true);
    };

    const choose = (item: T | null) => {
        onSelect(item);
        onQueryChange('');
        onOpenChange(false);
        inputRef.current?.blur();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();

            if (open === false) {
                openList();
                return;
            }

            const lastIndex = source.items.length - 1;

            if (activeIndex >= lastIndex - 1 && canLoadMore) {
                loadMore();
            }

            setActiveIndex((index) => Math.min(index + 1, lastIndex));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
        } else if (event.key === 'Enter' && open) {
            const item = source.items[activeIndex];

            if (item !== undefined) {
                event.preventDefault();
                choose(item);
            }
        } else if (event.key === 'Escape' && open) {
            event.preventDefault();
            onOpenChange(false);
        }
    };

    const activeItem = source.items[activeIndex];
    const optionId = (item: T) => `${listId}-${getKey(item)}`;

    return (
        <div ref={rootRef} className={cn('relative w-full', className)}>
            <span id={labelId} className="sr-only">
                {texts.label}
            </span>

            <div
                className={cn(
                    'bg-surface border-line rounded-card flex min-h-11 items-center gap-2 border px-3 transition-colors',
                    open ? 'border-primary ring-primary/20 ring-2' : 'hover:border-primary/50',
                )}
            >
                {leadingIcon}

                <input
                    ref={inputRef}
                    role="combobox"
                    aria-labelledby={labelId}
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={open && activeItem !== undefined ? optionId(activeItem) : undefined}
                    value={open ? query : selectedLabel}
                    placeholder={texts.placeholder}
                    onFocus={openList}
                    onClick={() => {
                        if (open === false) {
                            openList();
                        }
                    }}
                    onChange={(event) => {
                        onQueryChange(event.target.value);
                        setActiveIndex(-1);
                        onOpenChange(true);
                    }}
                    onKeyDown={handleKeyDown}
                    className="text-body text-ink placeholder:text-muted min-w-0 flex-1 bg-transparent py-2 outline-none"
                />

                {selectedKey === null ? (
                    <ChevronDown aria-hidden="true" className={cn('text-muted size-4 transition-transform', open && 'rotate-180')} />
                ) : (
                    <button
                        type="button"
                        onClick={() => choose(null)}
                        aria-label={texts.clear}
                        className="text-muted hover:bg-neutral-soft hover:text-ink focus-visible:outline-primary flex size-7 items-center justify-center rounded-full transition-colors focus-visible:outline-2"
                    >
                        <X aria-hidden="true" className="size-4" />
                    </button>
                )}
            </div>

            {open ? (
                <div className="bg-surface border-line rounded-card shadow-raised motion-rise absolute z-20 mt-1.5 w-full overflow-hidden border">
                    <ul
                        ref={listRef}
                        id={listId}
                        role="listbox"
                        aria-labelledby={labelId}
                        aria-busy={source.isLoading}
                        className="max-h-80 overflow-y-auto p-1.5"
                    >
                        {source.items.map((item, index) => {
                            const key = getKey(item);

                            return (
                                <li
                                    key={key}
                                    id={optionId(item)}
                                    role="option"
                                    aria-selected={key === selectedKey}
                                    onMouseDown={preventBlur}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => choose(item)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            choose(item);
                                        }
                                    }}
                                    className={cn(
                                        'flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors',
                                        index === activeIndex && 'bg-primary-light',
                                        key === selectedKey && 'ring-primary/40 ring-1',
                                    )}
                                >
                                    {renderOption(item, query.trim())}
                                </li>
                            );
                        })}

                        {source.hasMore ? <li ref={sentinelRef} aria-hidden="true" className="h-px" /> : null}

                        {source.isLoading
                            ? Array.from({ length: source.items.length === 0 ? 4 : 2 }, (_, index) => (
                                <li key={`skeleton-${String(index)}`} aria-hidden="true" className="flex items-center gap-3 px-2.5 py-2">
                                    <Skeleton className="size-8 shrink-0 rounded-full" />
                                    <span className="flex flex-1 flex-col gap-1.5">
                                        <Skeleton className="h-3.5 w-1/2" />
                                        <Skeleton className="h-3 w-3/4" />
                                    </span>
                                </li>
                            ))
                            : null}

                        {source.isLoading === false && source.failed === false && source.items.length === 0 ? (
                            <li className="text-body text-muted px-3 py-6 text-center">{texts.empty}</li>
                        ) : null}
                    </ul>
                    {source.failed && (
                        <div className="border-line text-caption text-muted flex items-center justify-between gap-2 border-t px-3 py-2">
                            <span role="alert">{texts.failed}</span>
                            <button
                                type="button"
                                onMouseDown={preventBlur}
                                onClick={source.retry}
                                className="text-primary hover:text-primary-dark inline-flex items-center gap-1 font-medium"
                            >
                                <RotateCcw aria-hidden="true" className="size-3.5" />
                                {strings.common.retry}
                            </button>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};
