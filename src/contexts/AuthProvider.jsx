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

  // Fixed token validation with proper error handling
  const validateToken = (token) => {
    if (!token || typeof token !== 'string') {
      console.warn('❌ No token provided');
      return false;
    }
    
    try {
      // Basic token structure validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('❌ Invalid token structure');
        return false;
      }
      
      // Safe base64 decoding with error handling
      try {
        const payload = JSON.parse(decodeURIComponent(atob(parts[1]).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')));
        
        // Check expiration
        const exp = payload.exp;
        if (exp && Date.now() >= exp * 1000) {
          console.warn('⏰ Token expired');
          return false;
        }
        
        return true;
      } catch (decodeError) {
        console.warn('❌ Token payload decoding failed, trying alternative method:', decodeError);
        
        // Alternative decoding method
        try {
          const payload = JSON.parse(atob(parts[1]));
          const exp = payload.exp;
          if (exp && Date.now() >= exp * 1000) {
            console.warn('⏰ Token expired');
            return false;
          }
          return true;
        } catch (altError) {
          console.warn('❌ Alternative token decoding also failed:', altError);
          return false;
        }
      }
    } catch (error) {
      console.warn('❌ Token validation failed, but proceeding with basic check:', error);
      // Even if decoding fails, if token exists and has basic structure, consider it valid
      // The backend will ultimately validate it
      return token.length > 10; // Basic length check
    }
  };

  // Enhanced authentication state check with better error recovery
  const checkAuthState = async () => {
    console.log('🔐 Checking authentication state...');
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    console.log('📊 Auth state:', { 
      hasToken: !!token, 
      hasUserData: !!userData,
      tokenLength: token ? token.length : 0
    });

    // If we have a token but no user data, try to fetch user data
    if (token && !userData) {
      console.log('🔄 Token exists but no user data, attempting to fetch user profile...');
      try {
        // You'll need to implement this API call based on your backend
        // const userResponse = await authAPI.getProfile(token);
        // if (userResponse.success) {
        //   localStorage.setItem('userData', JSON.stringify(userResponse.user));
        //   setUser(userResponse.user);
        //   setError(null);
        //   setLoading(false);
        //   return;
        // }
        console.warn('⚠️ User data fetch not implemented');
      } catch (fetchError) {
        console.error('❌ Failed to fetch user data:', fetchError);
      }
    }

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
          user: parsedUserData.username || parsedUserData.email,
          id: parsedUserData.id 
        });
        setUser(parsedUserData);
        setError(null);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        // Clear invalid data but keep token for recovery
        localStorage.removeItem('userData');
        setUser(null);
        setError('Invalid user data. Please login again.');
      }
    } else if (token && !userData) {
      console.log('🔐 Token exists but no user data - partial authentication');
      // We have a token but no user data - set minimal auth state
      setUser({ id: 'unknown', partialAuth: true });
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

    const handleAuthEvent = (e) => {
      console.log('🎯 Auth event received:', e.type);
      checkAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChange', handleAuthEvent);
    
    // Check auth state periodically
    const interval = setInterval(() => {
      if (user) { // Only check if user is logged in
        checkAuthState();
      }
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChange', handleAuthEvent);
      clearInterval(interval);
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
      
      // Dispatch event for other components to react
      window.dispatchEvent(new Event('authStateChange'));
      console.log('✅ Login successful');
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
    localStorage.removeItem('cart'); // Clear cart data
    localStorage.removeItem('favorites'); // Clear favorites data
    
    setUser(null);
    setError(null);
    
    // Dispatch event for other components to react
    window.dispatchEvent(new Event('authStateChange'));
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('favoritesUpdated'));
    console.log('✅ Logout successful');
  };

  // Enhanced token getter with fallback
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

  // More reliable authentication check
  const isAuthenticated = () => {
    const token = getToken();
    const hasUser = !!user;
    
    // If we have a token and user data, we're authenticated
    if (token && hasUser) {
      return true;
    }
    
    // If we have a token but no user data (recovery scenario)
    if (token && !hasUser) {
      console.log('🔄 Partial authentication detected - attempting recovery');
      // Try to recover user data
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          return true;
        } catch (error) {
          console.warn('❌ Failed to recover user data');
        }
      }
    }
    
    return false;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
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

  // Force check authentication state
  const checkAuthentication = () => {
    checkAuthState();
  };

  const value = {
    // State
    user,
    loading,
    error,
    
    // Computed properties - FIXED: Use function call instead of immediate evaluation
    isAuthenticated: isAuthenticated(),
    
    // Actions
    login,
    logout,
    getToken,
    hasRole,
    refreshUser,
    checkAuthentication,
    
    // Debug info
    debugInfo: {
      hasToken: !!localStorage.getItem('authToken'),
      token: localStorage.getItem('authToken') ? '***' + localStorage.getItem('authToken').slice(-10) : null,
      hasUserData: !!localStorage.getItem('userData'),
      userData: user ? `User: ${user.username || user.email || user.id}` : 'No user'
    }
  };

  console.log('🔄 AuthProvider rendering:', { 
    user: user ? `User: ${user.username || user.email || user.id}` : 'No user',
    isAuthenticated: value.isAuthenticated,
    loading,
    tokenExists: !!localStorage.getItem('authToken')
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};