// src/contexts/AuthProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is admin
  const checkIsAdmin = (userData) => {
    return userData && (userData.role === 'admin' || userData.isAdmin === true);
  };

  // Enhanced token validation
  const validateToken = (token) => {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }
      
      // Try to decode payload for expiration check
      try {
        const payload = JSON.parse(atob(parts[1]));
        const exp = payload.exp;
        if (exp && Date.now() >= exp * 1000) {
          return false;
        }
        return true;
      } catch {
        // If decoding fails, do basic validation
        return token.length > 10;
      }
    } catch (error) {
      console.warn('Token validation warning:', error);
      return token.length > 10;
    }
  };

  // Get token function - ADDED THIS FUNCTION
  const getToken = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return null;
      }
      
      // Basic validation without strict checking
      const isValid = token.length > 10; // Basic length check
      if (!isValid) {
        console.warn('⚠️ Token appears invalid');
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  };

  // Check authentication state
  const checkAuthState = () => {
    console.log('🔐 Checking authentication state...');
    const token = getToken();
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const isTokenValid = validateToken(token);
        
        if (!isTokenValid) {
          console.warn('🔄 Token invalid, clearing auth data');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          setUser(null);
          setError('Session expired. Please login again.');
          setLoading(false);
          return;
        }

        const parsedUserData = JSON.parse(userData);
        console.log('✅ Valid auth data found:', { 
          user: parsedUserData.email || parsedUserData.username,
          role: parsedUserData.role,
          isAdmin: checkIsAdmin(parsedUserData)
        });
        
        setUser(parsedUserData);
        setError(null);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        localStorage.removeItem('userData');
        setUser(null);
        setError('Invalid user data. Please login again.');
      }
    } else {
      console.log('🔓 No auth data found');
      setUser(null);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuthState();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'userData') {
        console.log('🔄 Storage change detected:', e.key);
        checkAuthState();
      }
    };

    const handleAuthEvent = () => {
      console.log('🎯 Auth event received');
      checkAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChange', handleAuthEvent);
    window.addEventListener('authChange', handleAuthEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChange', handleAuthEvent);
      window.removeEventListener('authChange', handleAuthEvent);
    };
  }, []);

  const login = async (userData, token) => {
    console.log('🔑 Logging in user:', userData);
    
    if (!token || !userData) {
      setError('Invalid login data');
      throw new Error('Invalid login data');
    }

    try {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      setError(null);
      
      // Dispatch events for other components
      window.dispatchEvent(new Event('authStateChange'));
      window.dispatchEvent(new Event('authChange'));
      
      console.log('✅ Login successful:', {
        email: userData.email,
        role: userData.role,
        isAdmin: checkIsAdmin(userData)
      });
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError('Login failed. Please try again.');
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('cart');
    localStorage.removeItem('favorites');
    
    setUser(null);
    setError(null);
    
    // Dispatch events for other components
    window.dispatchEvent(new Event('authStateChange'));
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('favoritesUpdated'));
    
    console.log('✅ Logout successful');
  };

  // Get authentication status
  const isAuthenticated = () => {
    const token = getToken();
    const userData = localStorage.getItem('userData');
    return !!(token && userData);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Refresh user data
  const refreshUser = (updatedUserData) => {
    if (updatedUserData && user) {
      const newUserData = { ...user, ...updatedUserData };
      localStorage.setItem('userData', JSON.stringify(newUserData));
      setUser(newUserData);
      window.dispatchEvent(new Event('authStateChange'));
    }
  };

  const value = {
    // State
    user,
    loading,
    error,
    
    // Computed properties
    isAuthenticated: isAuthenticated(),
    isAdmin: checkIsAdmin(user),
    
    // Actions
    login,
    logout,
    getToken, // ADDED THIS FUNCTION TO THE CONTEXT VALUE
    hasRole,
    refreshUser,
    checkAuthentication: checkAuthState,
    
    // Debug info
    debugInfo: {
      hasToken: !!localStorage.getItem('authToken'),
      hasUserData: !!localStorage.getItem('userData'),
      userRole: user?.role,
      isAdmin: checkIsAdmin(user)
    }
  };

  console.log('🔄 AuthProvider rendering:', { 
    user: user ? `User: ${user.email || user.username}` : 'No user',
    isAuthenticated: value.isAuthenticated,
    isAdmin: value.isAdmin,
    loading
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};