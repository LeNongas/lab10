import { createContext } from 'react';
import type { LoginResponse, UserRole } from '../types/auth';

export interface AuthUser {
    id: number;
    username: string;
    role: UserRole;
}

export interface AuthContextValue {
    user: AuthUser | null;
    login: (auth: LoginResponse) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

export const AuthContext =
    createContext<AuthContextValue | undefined>(undefined);