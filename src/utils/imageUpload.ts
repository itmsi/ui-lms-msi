import { strings } from '@/locales/id';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const validateImageFile = (file: File): string | null => {
    if (ACCEPTED_IMAGE_TYPES.includes(file.type) === false) {
        return strings.materialEditor.errorBannerType;
    }

    return file.size > MAX_IMAGE_BYTES ? strings.materialEditor.errorBannerSize : null;
};
