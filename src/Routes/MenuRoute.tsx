import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { canOpenRoute } from '@/layout/navigation';

export const MenuRoute = () => {
    const { user } = useAuth();
    const { pathname } = useLocation();

    if (user === null) {
        return null;
    }

    return canOpenRoute(user.menu, pathname) ? <Outlet /> : <Navigate to="/403" replace />;
};
