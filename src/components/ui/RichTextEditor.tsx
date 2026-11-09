import { TableKit } from '@tiptap/extension-table';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    BetweenHorizontalEnd,
    BetweenHorizontalStart,
    BetweenVerticalEnd,
    BetweenVerticalStart,
    Bold,
    Italic,
    List,
    ListOrdered,
    Redo2,
    Table2,
    Trash2,
    Undo2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useId } from 'react';
import type { ReactNode } from 'react';

import { IconButton } from '@/components/ui/IconButton';
import { strings } from '@/locales/id';
import { cn } from '@/utils/cn';
import '@/components/ui/rich-text.css';

interface TableActionProps {
    text: string;
    hint: string;
    icon: LucideIcon;
    onClick: () => void;
    disabled?: boolean;
    tone?: 'default' | 'danger';
}

const TableAction = ({ text, hint, icon: Icon, onClick, disabled = false, tone = 'default' }: TableActionProps) => (
    <button
        type="button"
        title={hint}
        disabled={disabled}
        onClick={onClick}
        className={cn(
            'text-caption bg-surface inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 font-medium transition-colors',
            'focus-visible:outline-primary focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-40',
            tone === 'danger'
                ? 'border-danger/30 text-danger-ink hover:bg-danger-soft'
                : 'border-line text-ink hover:border-primary/60 hover:bg-primary-light',
        )}
    >
        <Icon aria-hidden="true" className={cn('size-3.5 shrink-0', tone === 'danger' ? null : 'text-primary')} />
        {text}
    </button>
);

const TableGroup = ({ label, children }: { label: string; children: ReactNode }) => (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
        <span aria-hidden="true" className="text-caption text-muted min-w-12 font-semibold">
            {label}
        </span>
        {children}
    </div>
);

interface RichTextEditorProps {
    label: string;
    value: string;
    onChange: (html: string) => void;
    hint?: string;
    error?: string;
    allowTables?: boolean;
    readOnly?: boolean;
    className?: string;
}

export const RichTextEditor = ({
    label,
    value,
    onChange,
    hint,
    error,
    allowTables = false,
    readOnly = false,
    className,
}: RichTextEditorProps) => {
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
            ...(allowTables ? [TableKit.configure({ table: { resizable: false } })] : []),
        ],
        content: value,
        editable: readOnly === false,
        onUpdate: ({ editor: instance }) => {
            onChange(instance.isEmpty ? '' : instance.getHTML());
        },
        editorProps: {
            attributes: {
                role: 'textbox',
                'aria-multiline': 'true',
                'aria-readonly': readOnly ? 'true' : 'false',
                'aria-labelledby': labelId,
                ...(describedBy === '' ? {} : { 'aria-describedby': describedBy }),
                class: 'text-body text-ink px-3.5 py-3',
            },
        },
    });

    const toolbarState = useEditorState({
        editor,
        selector: ({ editor: instance }) => {
            const isInTable = allowTables && instance !== null && instance.isActive('table');

            return {
                isBold: instance?.isActive('bold') ?? false,
                isItalic: instance?.isActive('italic') ?? false,
                isBulletList: instance?.isActive('bulletList') ?? false,
                isOrderedList: instance?.isActive('orderedList') ?? false,
                isInTable,
                canDeleteRow: isInTable && instance.can().deleteRow(),
                canDeleteColumn: isInTable && instance.can().deleteColumn(),
                canUndo: instance?.can().undo() ?? false,
                canRedo: instance?.can().redo() ?? false,
            };
        },
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
                    className={cn(
                        'border-line bg-neutral-soft/50 flex flex-wrap items-center gap-0.5 border-b px-1.5 py-1',
                        readOnly && 'hidden',
                    )}
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
                    {allowTables ? (
                        <button
                            type="button"
                            title={strings.richText.table.insertHint}
                            disabled={toolbarState?.isInTable === true}
                            onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                            className={cn(
                                'text-caption text-muted inline-flex h-9 items-center gap-1.5 rounded-lg px-2 font-medium transition-colors',
                                'hover:bg-neutral-soft hover:text-ink focus-visible:outline-primary focus-visible:outline-2',
                                'disabled:cursor-not-allowed disabled:opacity-40',
                            )}
                        >
                            <Table2 aria-hidden="true" className="size-4" />
                            {/* {strings.richText.table.insert} */}
                        </button>
                    ) : null}

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

                {allowTables && readOnly === false && toolbarState?.isInTable === true ? (
                    <div
                        role="toolbar"
                        aria-label={strings.richText.table.toolbarLabel}
                        aria-controls={fieldId}
                        className="border-line bg-primary-light/50 flex flex-col gap-2 border-b px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6"
                    >
                        <TableGroup label={strings.richText.table.rows}>
                            <TableAction
                                text={strings.richText.table.addAbove}
                                hint={strings.richText.table.addAboveHint}
                                icon={BetweenHorizontalStart}
                                onClick={() => editor?.chain().focus().addRowBefore().run()}
                            />
                            <TableAction
                                text={strings.richText.table.addBelow}
                                hint={strings.richText.table.addBelowHint}
                                icon={BetweenHorizontalEnd}
                                onClick={() => editor?.chain().focus().addRowAfter().run()}
                            />
                            <TableAction
                                text={strings.richText.table.remove}
                                hint={strings.richText.table.removeRowHint}
                                icon={Trash2}
                                tone="danger"
                                disabled={toolbarState.canDeleteRow === false}
                                onClick={() => editor?.chain().focus().deleteRow().run()}
                            />
                        </TableGroup>

                        <TableGroup label={strings.richText.table.columns}>
                            <TableAction
                                text={strings.richText.table.addLeft}
                                hint={strings.richText.table.addLeftHint}
                                icon={BetweenVerticalStart}
                                onClick={() => editor?.chain().focus().addColumnBefore().run()}
                            />
                            <TableAction
                                text={strings.richText.table.addRight}
                                hint={strings.richText.table.addRightHint}
                                icon={BetweenVerticalEnd}
                                onClick={() => editor?.chain().focus().addColumnAfter().run()}
                            />
                            <TableAction
                                text={strings.richText.table.remove}
                                hint={strings.richText.table.removeColumnHint}
                                icon={Trash2}
                                tone="danger"
                                disabled={toolbarState.canDeleteColumn === false}
                                onClick={() => editor?.chain().focus().deleteColumn().run()}
                            />
                        </TableGroup>

                        <div className="sm:ml-auto">
                            <TableAction
                                text={strings.richText.table.removeTable}
                                hint={strings.richText.table.removeTableHint}
                                icon={Trash2}
                                tone="danger"
                                onClick={() => editor?.chain().focus().deleteTable().run()}
                            />
                        </div>
                    </div>
                ) : null}

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
