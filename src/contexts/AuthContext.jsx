// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is admin
  const isAdmin = () => {
    return user && (user.role === 'admin' || user.isAdmin === true);
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    console.log('🔄 Checking auth state:', { 
      hasToken: !!token, 
      hasUserData: !!userData 
    });
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        console.log('✅ User authenticated:', {
          email: parsedUser.email,
          role: parsedUser.role,
          isAdmin: isAdmin()
        });
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);

    // Listen for auth changes
    const handleAuthChange = () => {
      const newToken = localStorage.getItem('authToken');
      const newUserData = localStorage.getItem('userData');
      
      if (newToken && newUserData) {
        try {
          const parsedUser = JSON.parse(newUserData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data on storage change:', error);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    
    // Dispatch event for other components
    window.dispatchEvent(new Event('authChange'));
    
    console.log('✅ User logged in:', {
      email: userData.email,
      role: userData.role,
      isAdmin: isAdmin()
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
    
    // Dispatch event for other components
    window.dispatchEvent(new Event('authChange'));
    
    console.log('✅ User logged out');
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin: isAdmin(),
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};