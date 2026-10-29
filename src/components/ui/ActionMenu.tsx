import { MoreVertical } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Popover } from '@/components/ui/Popover';
import { cn } from '@/utils/cn';

export interface ActionMenuItem {
    label: string;
    icon: LucideIcon;
    onSelect: () => void;
    tone?: 'neutral' | 'danger';
    disabled?: boolean;
}

interface ActionMenuProps {
    label: string;
    items: ActionMenuItem[];
    align?: 'start' | 'end';
    className?: string;
}

export const ActionMenu = ({ label, items, align = 'end', className }: ActionMenuProps) => (
    <Popover
        label={label}
        align={align}
        triggerClassName={cn('size-8', className)}
        panelClassName="w-48 p-1"
        trigger={<MoreVertical aria-hidden="true" className="size-4" />}
    >
        {(close) => (
            <ul className="flex flex-col">
                {items.map(({ label: itemLabel, icon: Icon, onSelect, tone = 'neutral', disabled = false }) => (
                    <li key={itemLabel}>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                                close();
                                onSelect();
                            }}
                            className={cn(
                                'text-body flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors',
                                'focus-visible:outline-primary focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-40',
                                tone === 'danger'
                                    ? 'text-danger-ink hover:bg-danger-soft'
                                    : 'text-ink hover:bg-neutral-soft',
                            )}
                        >
                            <Icon aria-hidden="true" className="size-4 shrink-0" />
                            {itemLabel}
                        </button>
                    </li>
                ))}
            </ul>
        )}
    </Popover>
);
