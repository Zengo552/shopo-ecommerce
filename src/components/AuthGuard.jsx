// src/components/AuthGuard.jsx
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';

export const useAuthGuard = (action = 'perform this action', requireAdmin = false) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.warn(`🚫 AuthGuard: User not authenticated for ${action}`);
      navigate('/login', { 
        state: { 
          from: window.location.pathname,
          message: `Please login to ${action}`
        }
      });
      return;
    }
    
    if (requireAdmin && !isAdmin) {
      console.warn(`🚫 AuthGuard: Admin privileges required for ${action}`, {
        userRole: user.role,
        userEmail: user.email
      });
      navigate('/', { 
        state: { 
          message: `Admin privileges required to ${action}`
        }
      });
    }
  }, [isAuthenticated, user, action, requireAdmin, isAdmin, navigate]);

  return { isAuthenticated, user, isAdmin };
};

// Component version
export const AuthGuard = ({ children, action = 'access this page', requireAdmin = false }) => {
  const { isAuthenticated, user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-64 p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-6">Please login to {action}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Go to Login
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-64 p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Access Required</h3>
          <p className="text-gray-600 mb-4">Admin privileges are required to {action}</p>
          <p className="text-sm text-gray-500 mb-6">
            Your role: <span className="font-medium">{user.role || 'user'}</span>
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Go to Home
            </button>
            <button 
              onClick={() => window.location.href = '/profile'}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};