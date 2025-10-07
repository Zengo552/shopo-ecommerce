// components/Admin/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return url
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin access is required but user is not admin, redirect to home
  if (requireAdmin && !isAdmin) {
    console.warn('Non-admin user attempted to access admin route:', {
      path: location.pathname,
      userRole: user?.role
    });
    return <Navigate to="/" replace />;
  }

  // Allow access to the requested route
  return children;
};

export default PrivateRoute;