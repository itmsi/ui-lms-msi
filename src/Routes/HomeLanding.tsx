import { Navigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { getLandingRoute } from '@/layout/navigation';
import { NoMenuAccess } from '@/pages/Errors/NoMenuAccess';

export const HomeLanding = () => {
    const { user } = useAuth();

    if (user === null) {
        return null;
    }

    const landingRoute = getLandingRoute(user.menu);

    return landingRoute === null ? <NoMenuAccess /> : <Navigate to={landingRoute} replace />;
};
