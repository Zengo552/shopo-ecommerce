// src/components/AuthGuard.jsx
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthProvider';

export const useAuthGuard = (action = 'perform this action') => {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      throw new Error(`Please login to ${action}`);
    }
  }, [isAuthenticated, user, action]);

  return { isAuthenticated, user };
};

// Component version
export const AuthGuard = ({ children, action = 'access this page' }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">Please login to {action}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return children;
};