const SHARE_PATH = /^\/s\/[A-Za-z0-9]+\/?$/;

export const toDirectDownloadUrl = (value: string): string | null => {
    try {
        const url = new URL(value);

        if (url.protocol !== 'https:' || SHARE_PATH.test(url.pathname) === false) {
            return null;
        }

        url.pathname = `${url.pathname.replace(/\/$/, '')}/download`;

        return url.href;
    } catch {
        return null;
    }
};
