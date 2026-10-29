export const MAX_ATTACHMENTS = 5;

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

export const ATTACHMENT_ACCEPT = ACCEPTED_EXTENSIONS.map((extension) => `.${extension}`).join(',');

export type AttachmentProblem = 'type' | 'size';

const extensionOf = (name: string): string => name.split('.').pop()?.toLowerCase() ?? '';

export const validateAttachment = (file: File): AttachmentProblem | null => {
    if (ACCEPTED_EXTENSIONS.includes(extensionOf(file.name)) === false) {
        return 'type';
    }

    return file.size > MAX_ATTACHMENT_BYTES ? 'size' : null;
};

export const isImageName = (name: string): boolean => ['jpg', 'jpeg', 'png', 'webp'].includes(extensionOf(name));

export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
        return `${String(Math.max(1, Math.round(bytes / 1024)))} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
};
