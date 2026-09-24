import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { PageLoading } from '@/components/patterns/PageLoading';
import { useAuth } from '@/hooks/useAuth';

/**
 * Guard ini hanya untuk pengalaman pengguna. Otorisasi sebenarnya milik API:
 * frontend tidak boleh dianggap sebagai lapisan keamanan.
 */
export const ProtectedRoute = () => {
    const { status } = useAuth();
    const location = useLocation();

    if (status === 'loading') {
        return <PageLoading />;
    }

    if (status === 'unauthenticated') {
        // Tujuan semula disimpan supaya pengguna kembali ke tempat yang ia tuju setelah masuk.
        return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
    }

    return <Outlet />;
};
