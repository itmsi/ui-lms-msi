const decodeSegment = (segment: string): unknown => {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const binary = window.atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
};

export const readTokenExpiry = (token: string): number | null => {
    try {
        const segment = token.split('.')[1];

        if (segment === undefined) {
            return null;
        }

        const payload = decodeSegment(segment);

        if (typeof payload !== 'object' || payload === null) {
            return null;
        }

        const { exp } = payload as { exp?: unknown };

        return typeof exp === 'number' ? exp * 1000 : null;
    } catch {
        return null;
    }
};

export const isTokenExpired = (token: string): boolean => {
    const expiry = readTokenExpiry(token);

    return expiry !== null && expiry <= Date.now();
};
