import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { canOpenRoute } from '@/layout/navigation';

/**
 * Menu dari backend menentukan apa yang tampil sekaligus apa yang boleh dibuka.
 * Guard ini hanya untuk pengalaman pengguna — otorisasi sesungguhnya milik API,
 * dan frontend tidak boleh dianggap sebagai lapisan keamanan.
 */
export const MenuRoute = () => {
    const { user } = useAuth();
    const { pathname } = useLocation();

    if (user === null) {
        return null;
    }

    return canOpenRoute(user.menu, pathname) ? <Outlet /> : <Navigate to="/403" replace />;
};
