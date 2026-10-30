import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useBackToList = (listPath: string) => {
    const navigate = useNavigate();
    const location = useLocation();

    return useCallback(() => {
        if (location.key === 'default') {
            void navigate(listPath);
            return;
        }

        void navigate(-1);
    }, [listPath, location.key, navigate]);
};
