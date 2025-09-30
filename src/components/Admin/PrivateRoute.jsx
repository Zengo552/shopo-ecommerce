// components/Admin/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, isAdmin }) => {
  // In a real app, you'd check if the user is authenticated and has admin role
  // For now, we'll use a simple check
  const isAuthenticated = !!localStorage.getItem('token');
  const userIsAdmin = localStorage.getItem('userRole') === 'admin';

  if (!isAuthenticated || (isAdmin && !userIsAdmin)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;