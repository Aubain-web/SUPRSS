// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useMe } from '../../hook/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const { data, isLoading, isError, error } = useMe();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    // Non authentifié (401)
    const status = (error as any)?.response?.status;
    if (isError && status === 401) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Autre erreur serveur -> on peut aussi renvoyer vers login
    if (isError && !data) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
