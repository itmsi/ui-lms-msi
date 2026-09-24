export type EmbedSourceId = 'wedrive' | 'wecom' | 'google';

export interface EmbedSource {
    id: EmbedSourceId;
    /** Nama sumber untuk label tombol dan judul iframe. */
    label: string;
    /** Alamat yang dimuat iframe. Bisa berbeda dari tautan aslinya (Google Drive butuh bentuk /preview). */
    src: string;
}

/*
 * Hanya sumber di daftar ini yang boleh dibingkai. Tautan lain tetap kartu biasa,
 * supaya URL sembarang yang diisi di materi tidak ikut dirender di dalam halaman.
 * Host dicocokkan persis, bukan `endsWith`, supaya `drive.google.com.contoh.com` ditolak.
 */
const WEDRIVE_HOST = 'drive.weixin.qq.com';
const WECOM_DOC_HOST = 'doc.weixin.qq.com';
const GOOGLE_DRIVE_HOST = 'drive.google.com';
const GOOGLE_DOCS_HOST = 'docs.google.com';

/** ID file Google panjangnya puluhan karakter; batas bawah 10 menolak segmen seperti "e" (dokumen terbit) atau "edit". */
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

/*
 * Tautan berbagi Google (`/view`, `/edit`) menolak dibingkai. Yang boleh hanya `/preview`,
 * jadi alamatnya disusun ulang dari ID yang sudah divalidasi — bukan URL asli yang
 * diteruskan apa adanya — supaya tidak ada bagian tautan lain yang ikut terbawa.
 */
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

/** `null` berarti tautan ini tidak di-embed dan cukup ditampilkan sebagai kartu tautan. */
export const resolveEmbed = (value: string): EmbedSource | null => {
    const url = parseUrl(value);

    // Konten http tidak dibingkai: diblokir sebagai mixed content dan tidak terenkripsi.
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
