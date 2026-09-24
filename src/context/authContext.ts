import { createContext } from 'react';

import type { AuthResult, Credentials } from '@/types/auth';
import type { AuthUser } from '@/types/user';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
    user: AuthUser | null;
    status: AuthStatus;
    signIn: (credentials: Credentials) => Promise<AuthResult>;
    signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
