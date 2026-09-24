import DOMPurify from 'dompurify';
import { useMemo } from 'react';

import { cn } from '@/utils/cn';
import '@/components/ui/rich-text.css';

/**
 * Daftar putih, bukan daftar hitam: hanya bentuk yang memang bisa dihasilkan
 * `RichTextEditor` yang diizinkan. Apa pun di luar ini dibuang, termasuk `<script>`,
 * `<iframe>`, dan atribut event.
 */
const ALLOWED_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li'];

/** Tidak ada atribut yang diizinkan sama sekali — termasuk `style`, `class`, dan `href`. */
const ALLOWED_ATTR: string[] = [];

interface RichTextProps {
    html: string;
    className?: string;
}

/**
 * Merender HTML yang tersimpan dari editor.
 *
 * Isinya datang dari API dan diperlakukan tidak tepercaya: siapa pun yang bisa
 * mengedit materi berpotensi menitipkan skrip yang berjalan di browser kandidat.
 * Karena itu `dangerouslySetInnerHTML` di sini hanya boleh menerima hasil sanitasi —
 * jangan pernah dipanggil di tempat lain tanpa melewati komponen ini.
 */
export const RichText = ({ html, className }: RichTextProps) => {
    const clean = useMemo(() => DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR }), [html]);

    return <div className={cn('rich-text text-body text-ink', className)} dangerouslySetInnerHTML={{ __html: clean }} />;
};
