import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: string;
}

export const ProtectedRoute = ({ children, fallback = '/auth' }: ProtectedRouteProps) => {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  // `user` is null until the initial session lookup resolves, so redirecting on
  // !user before then bounces signed-in people to /auth on every hard load,
  // refresh or deep link into a protected page.
  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallback} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};