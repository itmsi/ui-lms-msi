import { Navigate, Outlet } from 'react-router-dom';

import { PageLoading } from '@/components/patterns/PageLoading';
import { useAuth } from '@/hooks/useAuth';

/** Menjaga halaman Login supaya tidak muncul lagi untuk pengguna yang sudah masuk. */
export const GuestRoute = () => {
    const { status } = useAuth();

    if (status === 'loading') {
        return <PageLoading />;
    }

    return status === 'authenticated' ? <Navigate to="/dashboard" replace /> : <Outlet />;
};
