import { useContext } from 'react';

import { AuthContext } from '@/context/authContext';
import type { AuthContextValue } from '@/context/authContext';

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);

    if (context === null) {
        throw new Error('useAuth harus dipakai di dalam <AuthProvider>.');
    }

    return context;
};
