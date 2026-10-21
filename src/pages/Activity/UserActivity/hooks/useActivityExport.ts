import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { strings } from '@/locales/id';
import { exportActivities } from '@/services/activityService';
import type { ActivityExportFile, ActivityExportOutcome, ActivityExportQuery } from '@/types/activity';
import { toDirectDownloadUrl } from '@/utils/cloudShareLink';

const failureMessage = (outcome: Extract<ActivityExportOutcome, { ok: false }>): string => {
    if (outcome.code === 'validation' && outcome.message !== undefined) {
        return outcome.message;
    }

    if (outcome.code === 'unauthorized') {
        return strings.activityLog.exportUnauthorized;
    }

    return outcome.code === 'offline' ? strings.activityLog.exportOffline : strings.activityLog.exportFailed;
};

const toQueryKey = ({ moduleId, employeeId, dateRange }: ActivityExportQuery): string =>
    `${moduleId ?? ''}|${employeeId ?? ''}|${dateRange.start}|${dateRange.end}`;

export const useActivityExport = (query: ActivityExportQuery) => {
    const [isExporting, setIsExporting] = useState(false);
    const [result, setResult] = useState<{ key: string; file: ActivityExportFile } | null>(null);
    const inFlight = useRef(false);

    const queryKey = toQueryKey(query);
    const file = result !== null && result.key === queryKey ? result.file : null;

    const exportFile = useCallback(async () => {
        if (inFlight.current) {
            return;
        }

        inFlight.current = true;
        setIsExporting(true);

        try {
            const outcome = await exportActivities(query);

            if (outcome.ok) {
                const directUrl = toDirectDownloadUrl(outcome.data.url);

                if (directUrl === null) {
                    setResult({ key: toQueryKey(query), file: outcome.data });
                } else {
                    setResult(null);
                    window.location.assign(directUrl);
                    toast.success(strings.activityLog.exportStarted);
                }
            } else {
                toast.error(failureMessage(outcome));
            }
        } finally {
            inFlight.current = false;
            setIsExporting(false);
        }
    }, [query]);

    const dismiss = useCallback(() => setResult(null), []);

    return { isExporting, file, exportFile, dismiss };
};
