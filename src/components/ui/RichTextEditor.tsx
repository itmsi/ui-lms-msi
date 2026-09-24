import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Redo2, Undo2 } from 'lucide-react';
import { useId } from 'react';

import { IconButton } from '@/components/ui/IconButton';
import { strings } from '@/locales/id';
import { cn } from '@/utils/cn';
import '@/components/ui/rich-text.css';

interface RichTextEditorProps {
    label: string;
    /** HTML. String kosong berarti belum ada isi. */
    value: string;
    onChange: (html: string) => void;
    hint?: string;
    error?: string;
    className?: string;
}

/**
 * Editor teks kaya untuk deskripsi.
 *
 * Kemampuannya sengaja dipersempit ke tebal, miring, dan dua jenis daftar. Setiap
 * elemen yang bisa dihasilkan di sini nantinya harus dirender — dan disanitasi — di
 * sisi Candidate, jadi makin sedikit bentuk yang mungkin muncul, makin kecil permukaan
 * yang harus dijaga. Heading, kutipan, blok kode, dan tautan inline dimatikan; tautan
 * materi sudah punya field terstruktur sendiri.
 */
export const RichTextEditor = ({ label, value, onChange, hint, error, className }: RichTextEditorProps) => {
    const fieldId = useId();
    const labelId = `${fieldId}-label`;
    const hintId = `${fieldId}-hint`;
    const errorId = `${fieldId}-error`;
    const describedBy = [hint === undefined ? null : hintId, error === undefined ? null : errorId]
        .filter((id): id is string => id !== null)
        .join(' ');

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                blockquote: false,
                code: false,
                codeBlock: false,
                horizontalRule: false,
                strike: false,
                underline: false,
                link: false,
            }),
        ],
        content: value,
        onUpdate: ({ editor: instance }) => {
            // Editor kosong menghasilkan "<p></p>"; simpan string kosong supaya
            // pemeriksaan "ada isinya atau tidak" tetap sederhana di sisi lain.
            onChange(instance.isEmpty ? '' : instance.getHTML());
        },
        editorProps: {
            attributes: {
                role: 'textbox',
                'aria-multiline': 'true',
                'aria-labelledby': labelId,
                ...(describedBy === '' ? {} : { 'aria-describedby': describedBy }),
                class: 'text-body text-ink px-3.5 py-3',
            },
        },
    });

    /**
     * `useEditor` tidak merender ulang pada tiap transaksi, jadi status aktif tombol
     * dibaca lewat `useEditorState` — tanpa ini tombol tidak menyala saat kursor
     * berpindah ke teks yang sudah tebal.
     */
    const toolbarState = useEditorState({
        editor,
        selector: ({ editor: instance }) => ({
            isBold: instance?.isActive('bold') ?? false,
            isItalic: instance?.isActive('italic') ?? false,
            isBulletList: instance?.isActive('bulletList') ?? false,
            isOrderedList: instance?.isActive('orderedList') ?? false,
            canUndo: instance?.can().undo() ?? false,
            canRedo: instance?.can().redo() ?? false,
        }),
    });

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <span id={labelId} className="text-body text-ink font-medium">
                {label}
            </span>

            <div
                className={cn(
                    'rich-text-editor bg-surface overflow-hidden rounded-lg border transition-colors',
                    'focus-within:border-primary',
                    error === undefined ? 'border-line' : 'border-danger',
                )}
            >
                <div
                    role="toolbar"
                    aria-label={strings.richText.toolbarLabel}
                    aria-controls={fieldId}
                    className="border-line bg-neutral-soft/50 flex items-center gap-0.5 border-b px-1.5 py-1"
                >
                    <IconButton
                        label={strings.richText.bold}
                        aria-pressed={toolbarState?.isBold ?? false}
                        icon={<Bold aria-hidden="true" className="size-4" />}
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                    />
                    <IconButton
                        label={strings.richText.italic}
                        aria-pressed={toolbarState?.isItalic ?? false}
                        icon={<Italic aria-hidden="true" className="size-4" />}
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                    />
                    <IconButton
                        label={strings.richText.bulletList}
                        aria-pressed={toolbarState?.isBulletList ?? false}
                        icon={<List aria-hidden="true" className="size-4" />}
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    />
                    <IconButton
                        label={strings.richText.orderedList}
                        aria-pressed={toolbarState?.isOrderedList ?? false}
                        icon={<ListOrdered aria-hidden="true" className="size-4" />}
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    />

                    <span className="bg-line mx-1 h-5 w-px" />

                    <IconButton
                        label={strings.richText.undo}
                        disabled={toolbarState?.canUndo === false}
                        icon={<Undo2 aria-hidden="true" className="size-4" />}
                        onClick={() => editor?.chain().focus().undo().run()}
                    />
                    <IconButton
                        label={strings.richText.redo}
                        disabled={toolbarState?.canRedo === false}
                        icon={<Redo2 aria-hidden="true" className="size-4" />}
                        onClick={() => editor?.chain().focus().redo().run()}
                    />
                </div>

                <EditorContent id={fieldId} editor={editor} />
            </div>

            {hint === undefined ? null : (
                <p id={hintId} className="text-caption text-muted">
                    {hint}
                </p>
            )}
            {error === undefined ? null : (
                <p id={errorId} className="text-caption text-danger-ink">
                    {error}
                </p>
            )}
        </div>
    );
};
