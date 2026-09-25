import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { PageLoading } from '@/components/patterns/PageLoading';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = () => {
    const { status } = useAuth();
    const location = useLocation();

    if (status === 'loading') {
        return <PageLoading />;
    }

    if (status === 'unauthenticated') {
        return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
    }

    return <Outlet />;
};
