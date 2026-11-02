import { useCallback, useState } from 'react';

export const useSidebarCollapsed = () => {
    const [collapsed, setCollapsed] = useState(false);

    const toggle = useCallback(() => setCollapsed((previous) => previous === false), []);

    return { collapsed, toggle };
};
