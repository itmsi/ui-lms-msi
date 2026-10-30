export const toHttpsUrl = (value: unknown): string | null => {
    if (typeof value !== 'string' || value === '') {
        return null;
    }

    try {
        const url = new URL(value);

        return url.protocol === 'https:' ? url.href : null;
    } catch {
        return null;
    }
};
