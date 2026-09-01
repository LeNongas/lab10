import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (requiredRole && user?.role !== requiredRole) return <Navigate to="/courses" replace />;
    return <>{children}</>;
}
