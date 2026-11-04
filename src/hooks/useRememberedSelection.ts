import { useCallback, useState } from 'react';

export const useRememberedSelection = <T extends { id: string }>(id: string | null, onSelect: (id: string | null) => void) => {
    const [known, setKnown] = useState<Record<string, T>>({});

    const remember = useCallback((items: T[]) => {
        setKnown((previous) => {
            const next = { ...previous };

            for (const item of items) {
                next[item.id] = item;
            }

            return next;
        });
    }, []);

    const select = useCallback(
        (item: T | null) => {
            if (item !== null) {
                remember([item]);
            }

            onSelect(item?.id ?? null);
        },
        [onSelect, remember],
    );

    return { known, selected: id === null ? null : (known[id] ?? null), remember, select };
};
