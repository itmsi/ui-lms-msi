const BLOCK_BOUNDARY = /<(br|\/p|\/li|\/h[1-6]|\/div|\/blockquote)\b[^>]*>/gi;

export const htmlToPlainText = (html: string): string => {
    if (html === '') {
        return '';
    }

    const document = new DOMParser().parseFromString(html.replace(BLOCK_BOUNDARY, '$& '), 'text/html');

    return (document.body.textContent ?? '').replace(/\s+/g, ' ').trim();
};

export const truncateWords = (text: string, maxWords: number): string => {
    const words = text.split(' ').filter((word) => word !== '');

    return words.length <= maxWords ? words.join(' ') : `${words.slice(0, maxWords).join(' ')}…`;
};

export const DESCRIPTION_EXCERPT_WORDS = 20;

export const toDescriptionExcerpt = (html: string): string =>
    truncateWords(htmlToPlainText(html), DESCRIPTION_EXCERPT_WORDS);
