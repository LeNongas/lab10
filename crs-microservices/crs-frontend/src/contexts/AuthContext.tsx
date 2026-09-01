import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { LoginResponse } from '../types/auth';
import { AuthContext } from './authContextValue';
import type { AuthContextValue } from './authContextValue';

function readStoredUser(): Omit<LoginResponse, 'token'> | null {
    const token = localStorage.getItem('crs_token');
    const rawUser = localStorage.getItem('crs_user');
    if (!token || !rawUser) return null;

    try {
        return JSON.parse(rawUser) as Omit<LoginResponse, 'token'>;
    } catch {
        localStorage.removeItem('crs_token');
        localStorage.removeItem('crs_user');
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState(readStoredUser);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        isAuthenticated: Boolean(user && localStorage.getItem('crs_token')),
        login: ({ token, username, role }) => {
            const currentUser = { username, role };
            localStorage.setItem('crs_token', token);
            localStorage.setItem('crs_user', JSON.stringify(currentUser));
            setUser(currentUser);
        },
        logout: () => {
            localStorage.removeItem('crs_token');
            localStorage.removeItem('crs_user');
            setUser(null);
        },
    }), [user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
