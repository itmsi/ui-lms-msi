import DOMPurify from 'dompurify';
import { useMemo } from 'react';

import { cn } from '@/utils/cn';
import '@/components/ui/rich-text.css';

const ALLOWED_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li'];

const ALLOWED_ATTR: string[] = [];

interface RichTextProps {
    html: string;
    className?: string;
}

export const RichText = ({ html, className }: RichTextProps) => {
    const clean = useMemo(() => DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR }), [html]);

    return <div className={cn('rich-text text-body text-ink', className)} dangerouslySetInnerHTML={{ __html: clean }} />;
};
