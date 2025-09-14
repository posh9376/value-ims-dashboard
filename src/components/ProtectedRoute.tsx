import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  fallbackPath = '/auth/login',
}) => {
  const location = useLocation();
  
  // For now, we'll assume user is always authenticated
  // You can add your authentication logic here later
  const isAuthenticated = true; // Replace with actual auth check
  const isLoading = false; // Replace with actual loading state

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
