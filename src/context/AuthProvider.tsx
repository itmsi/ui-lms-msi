import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { AuthContext } from '@/context/authContext';
import type { AuthStatus } from '@/context/authContext';
import * as authService from '@/services/authService';
import type { Credentials } from '@/types/auth';
import type { AuthUser } from '@/types/user';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    // Cache localStorage dipakai sebagai tampilan awal supaya muat ulang tidak berkedip.
    // Nilainya tetap diverifikasi ke server di efek di bawah.
    const [cachedUser] = useState(() => authService.readSessionFromCache());
    const [user, setUser] = useState<AuthUser | null>(cachedUser);
    const [status, setStatus] = useState<AuthStatus>(cachedUser === null ? 'loading' : 'authenticated');

    useEffect(() => {
        let active = true;

        const restore = async () => {
            const restored = await authService.restoreSession();

            if (active === false) {
                return;
            }

            setUser(restored);
            setStatus(restored === null ? 'unauthenticated' : 'authenticated');
        };

        void restore();

        return () => {
            active = false;
        };
    }, []);

    const signIn = useCallback(async (credentials: Credentials) => {
        const result = await authService.signIn(credentials);

        if (result.ok) {
            setUser(result.user);
            setStatus('authenticated');
        }

        return result;
    }, []);

    const signOut = useCallback(() => {
        authService.signOut();
        setUser(null);
        setStatus('unauthenticated');
    }, []);

    const value = useMemo(() => ({ user, status, signIn, signOut }), [user, status, signIn, signOut]);

    return <AuthContext value={value}>{children}</AuthContext>;
};
