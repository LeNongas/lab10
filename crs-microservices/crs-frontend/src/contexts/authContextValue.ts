import { createContext } from 'react';
import type { LoginResponse } from '../types/auth';

export interface AuthContextValue {
    user: Omit<LoginResponse, 'token'> | null;
    login: (auth: LoginResponse) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
