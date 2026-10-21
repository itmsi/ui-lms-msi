import { Download, FileCheck2, FileSpreadsheet, LoaderCircle, X } from 'lucide-react';

import { getButtonClassName } from '@/components/ui/buttonStyles';
import { IconButton } from '@/components/ui/IconButton';
import { strings } from '@/locales/id';
import type { ActivityExportFile } from '@/types/activity';
import { cn } from '@/utils/cn';

interface ExportExcelButtonProps {
    disabled: boolean;
    isExporting: boolean;
    file: ActivityExportFile | null;
    onExport: () => void;
    onDismiss: () => void;
}

export const ExportExcelButton = ({ disabled, isExporting, file, onExport, onDismiss }: ExportExcelButtonProps) => (
    <div className="flex flex-col items-start gap-2 sm:items-end">
        <button
            type="button"
            onClick={onExport}
            disabled={disabled || isExporting}
            aria-busy={isExporting || undefined}
            className={cn(
                'text-body inline-flex h-10 items-center gap-2 rounded-3xl px-4 font-semibold text-white cursor-pointer',
                'shadow-[0_1px_2px_rgb(1_30_60/0.2),0_8px_16px_-10px_rgb(1_30_60/0.6)] transition-[translate,box-shadow,opacity] bg-gradiend',
                'enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_2px_4px_rgb(1_30_60/0.2),0_12px_20px_-10px_rgb(1_30_60/0.65)]',
                'focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-60',
            )}
        >
            {isExporting ? (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
                <FileSpreadsheet aria-hidden="true" className="size-4" />
            )}
            <span>{isExporting ? strings.activityLog.exportPreparing : strings.activityLog.exportAction}</span>
        </button>

        {file === null ? null : (
            <div
                role="status"
                className="bg-surface border-line rounded-card shadow-raised motion-rise flex items-center gap-3 border p-2 pl-3"
            >
                <FileCheck2 aria-hidden="true" className="text-success-ink size-5 shrink-0" />
                <span className="text-body text-ink font-medium">{strings.activityLog.exportReadyTitle}</span>
                <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={getButtonClassName({ variant: 'primary', size: 'sm' })}
                >
                    <Download aria-hidden="true" className="size-4" />
                    <span>{strings.activityLog.exportDownload}</span>
                </a>
                <IconButton
                    label={strings.activityLog.exportDismiss}
                    icon={<X aria-hidden="true" className="size-4" />}
                    onClick={onDismiss}
                />
            </div>
        )}
    </div>
);
