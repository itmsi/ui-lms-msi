export type EmbedSourceId = 'wedrive' | 'wecom' | 'google';

export interface EmbedSource {
    id: EmbedSourceId;
    label: string;
    src: string;
}

const WEDRIVE_HOST = 'drive.weixin.qq.com';
const WECOM_DOC_HOST = 'doc.weixin.qq.com';
const GOOGLE_DRIVE_HOST = 'drive.google.com';
const GOOGLE_DOCS_HOST = 'docs.google.com';

const GOOGLE_ID = /^[\w-]{10,}$/;
const GOOGLE_DRIVE_FILE_PATHS = ['file', 'open', 'uc'];
const GOOGLE_DOC_PATHS = ['document', 'spreadsheets', 'presentation'];

const parseUrl = (value: string): URL | null => {
    try {
        return new URL(value);
    } catch {
        return null;
    }
};

const toGooglePreview = (url: URL): string | null => {
    const segments = url.pathname.split('/').filter((segment) => segment !== '');
    const first: string | undefined = segments[0];
    const dIndex = segments.indexOf('d');
    const idFromPath: string | undefined = dIndex === -1 ? undefined : segments[dIndex + 1];
    const id = idFromPath ?? url.searchParams.get('id');

    if (first === undefined || id === null || GOOGLE_ID.test(id) === false) {
        return null;
    }

    if (url.hostname === GOOGLE_DRIVE_HOST && GOOGLE_DRIVE_FILE_PATHS.includes(first)) {
        return `https://${GOOGLE_DRIVE_HOST}/file/d/${id}/preview`;
    }

    if (url.hostname === GOOGLE_DOCS_HOST && GOOGLE_DOC_PATHS.includes(first)) {
        return `https://${GOOGLE_DOCS_HOST}/${first}/d/${id}/preview`;
    }

    return null;
};

export const resolveEmbed = (value: string): EmbedSource | null => {
    const url = parseUrl(value);

    if (url === null || url.protocol !== 'https:') {
        return null;
    }

    if (url.hostname === WEDRIVE_HOST) {
        return { id: 'wedrive', label: 'WeDrive', src: url.href };
    }

    if (url.hostname === WECOM_DOC_HOST) {
        return { id: 'wecom', label: 'WeCom', src: url.href };
    }

    if (url.hostname === GOOGLE_DRIVE_HOST || url.hostname === GOOGLE_DOCS_HOST) {
        const src = toGooglePreview(url);

        return src === null ? null : { id: 'google', label: 'Google Drive', src };
    }

    return null;
};
