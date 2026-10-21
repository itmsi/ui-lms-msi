export const parsePageParam = (value: string | null): number => {
    const page = Number.parseInt(value ?? '', 10);

    return Number.isFinite(page) && page > 0 ? page : 1;
};
