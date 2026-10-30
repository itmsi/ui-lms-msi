import { useEffect } from 'react';

export const useBeforeUnloadWarning = (active: boolean) => {
    useEffect(() => {
        if (active === false) {
            return;
        }

        const warn = (event: BeforeUnloadEvent) => {
            event.preventDefault();
        };

        window.addEventListener('beforeunload', warn);

        return () => {
            window.removeEventListener('beforeunload', warn);
        };
    }, [active]);
};
