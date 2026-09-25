import { Navigate, Outlet } from 'react-router-dom';

import { PageLoading } from '@/components/patterns/PageLoading';
import { useAuth } from '@/hooks/useAuth';

export const GuestRoute = () => {
    const { status } = useAuth();

    if (status === 'loading') {
        return <PageLoading />;
    }

    return status === 'authenticated' ? <Navigate to="/dashboard" replace /> : <Outlet />;
};
