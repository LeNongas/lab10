import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { LoginResponse } from '../types/auth';
import { AuthContext } from './authContextValue';
import type {
    AuthContextValue,
    AuthUser,
} from './authContextValue';

function readStoredUser(): AuthUser | null {
    const token = localStorage.getItem('crs_token');
    const rawUser = localStorage.getItem('crs_user');

    if (!token || !rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser) as AuthUser;
    } catch {
        localStorage.removeItem('crs_token');
        localStorage.removeItem('crs_user');
        return null;
    }
}

export function AuthProvider({
                                 children,
                             }: {
    children: ReactNode;
}) {
    const [user, setUser] = useState<AuthUser | null>(
        readStoredUser
    );

    const value = useMemo<AuthContextValue>(
        () => ({
            user,

            isAuthenticated: Boolean(
                user &&
                localStorage.getItem('crs_token')
            ),

            login: ({
                        userId,
                        token,
                        username,
                        role,
                    }: LoginResponse) => {

                const currentUser: AuthUser = {
                    id: userId,
                    username,
                    role,
                };

                localStorage.setItem(
                    'crs_token',
                    token
                );

                localStorage.setItem(
                    'crs_user',
                    JSON.stringify(currentUser)
                );

                setUser(currentUser);
            },

            logout: () => {
                localStorage.removeItem('crs_token');
                localStorage.removeItem('crs_user');
                setUser(null);
            },
        }),
        [user]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}