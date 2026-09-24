import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { LoginResponse } from '../types/auth';
import { AuthContext } from './authContextValue';
import type {
    AuthContextValue,
    AuthUser,
} from './authContextValue';

function readStoredUser(): AuthUser | null {
    const token = localStorage.getItem('homestay_token');
    const rawUser = localStorage.getItem('homestay_user');

    if (!token || !rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser) as AuthUser;
    } catch {
        localStorage.removeItem('homestay_token');
        localStorage.removeItem('homestay_user');
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
                localStorage.getItem('homestay_token')
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
                    'homestay_token',
                    token
                );

                localStorage.setItem(
                    'homestay_user',
                    JSON.stringify(currentUser)
                );

                setUser(currentUser);
            },

            logout: () => {
                localStorage.removeItem('homestay_token');
                localStorage.removeItem('homestay_user');
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