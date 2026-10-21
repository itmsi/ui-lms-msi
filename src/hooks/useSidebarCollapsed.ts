import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'msi-learning:sidebar-collapsed';

const readStored = (): boolean => {
    try {
        return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return false;
    }
};

export const useSidebarCollapsed = () => {
    const [collapsed, setCollapsed] = useState(readStored);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
        } catch {
            return;
        }
    }, [collapsed]);

    const toggle = useCallback(() => setCollapsed((previous) => previous === false), []);

    return { collapsed, toggle };
};
