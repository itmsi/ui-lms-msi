/** Menghasilkan salinan baru; tidak pernah mengubah array aslinya. */
export const replaceAt = <T>(items: T[], index: number, value: T): T[] =>
    items.map((item, position) => (position === index ? value : item));

export const removeAt = <T>(items: T[], index: number): T[] => items.filter((_, position) => position !== index);

/** Memindahkan satu item; di luar rentang dikembalikan apa adanya, bukan dilempar error. */
export const moveItem = <T>(items: T[], from: number, to: number): T[] => {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
        return items;
    }

    const next = [...items];
    const [moved] = next.splice(from, 1);

    if (moved === undefined) {
        return items;
    }

    next.splice(to, 0, moved);

    return next;
};
