// src/contexts/FavoriteProvider.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { favoriteAPI } from '../services/api';

const FavoriteContext = createContext();

export const useFavorite = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorite must be used within a FavoriteProvider');
  }
  return context;
};

export const FavoriteProvider = ({ children }) => {
  const { user, isAuthenticated, getToken, checkAuthentication } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Enhanced favorites fetch with better auth handling
  const fetchFavorites = async (forceRetry = false) => {
    console.log('❤️ Fetching favorites...', { 
      isAuthenticated, 
      hasUser: !!user,
      userId: user?.id 
    });

    // Comprehensive auth check
    const token = getToken();
    const hasLocalToken = !!localStorage.getItem('authToken');
    
    if (!isAuthenticated || !user || !token || !hasLocalToken) {
      console.log('🔐 Not authenticated, clearing favorites');
      setFavorites([]);
      setLoading(false);
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Calling favorites API...');
      const response = await favoriteAPI.getUserFavorites();
      console.log('📦 Favorites API response:', response);

      if (response.success) {
        // Handle different response formats
        const favoritesData = response.favorites || response.data || [];
        console.log('✅ Favorites fetched successfully:', favoritesData.length, 'items');
        
        // Ensure consistent data structure
        const normalizedFavorites = favoritesData.map(fav => ({
          productId: fav.productId || fav.id,
          productName: fav.productName || fav.name,
          price: fav.price || 0,
          imageUrl: fav.imageUrl || fav.image || fav.thumbnail || fav.productImage,
          // Add all common image fields for frontend compatibility
          image: fav.image || fav.imageUrl || fav.thumbnail,
          thumbnail: fav.thumbnail || fav.imageUrl || fav.image,
          productImage: fav.productImage || fav.imageUrl || fav.image
        }));
        
        setFavorites(normalizedFavorites);
        setRetryCount(0); // Reset retry count on success
      } else {
        console.log('⚠️ No favorites data received');
        setFavorites([]);
      }
    } catch (error) {
      console.error('❌ Error fetching favorites:', error);
      
      // Handle authentication errors specifically
      if (error.message.includes('Authentication') || error.message.includes('401')) {
        setError('Session expired. Please login again.');
        
        // Force re-authentication check
        checkAuthentication();
        
        // Retry once after a short delay if it might be a token sync issue
        if (retryCount < 1 && !forceRetry) {
          console.log('🔄 Retrying favorites fetch due to auth error...');
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchFavorites(true), 1000);
          return;
        }
      } else {
        setError(error.message);
      }
      
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced add to favorites with better auth handling
  const addToFavorites = async (productId) => {
    console.log('➕ Adding to favorites:', productId);
    
    // Comprehensive auth check
    const token = getToken();
    if (!isAuthenticated || !token) {
      const errorMsg = 'Please login to add favorites';
      console.warn('🔐 Auth check failed:', errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const normalizedId = Number(productId);
      if (isNaN(normalizedId)) {
        throw new Error('Invalid product ID');
      }

      // Check if already in favorites to avoid duplicates
      if (isFavorite(normalizedId)) {
        console.log('⭐ Product already in favorites');
        return { success: true, message: 'Product already in favorites' };
      }

      console.log('📡 Calling add to favorites API...');
      const response = await favoriteAPI.addToFavorites(normalizedId);

      if (response.success) {
        console.log('✅ Added to favorites successfully');
        await fetchFavorites(); // Refresh favorites
        return response;
      }
      throw new Error(response.message || 'Failed to add to favorites');
    } catch (error) {
      console.error('❌ Error adding to favorites:', error);
      
      // Handle specific error types
      if (error.message.includes('Authentication') || error.message.includes('401')) {
        setError('Session expired during add to favorites');
        checkAuthentication();
        throw new Error('Session expired. Please login again.');
      }
      
      if (error.message.includes('already in favorites')) {
        // Silently handle already in favorites - just refresh the list
        await fetchFavorites();
        throw new Error('Product is already in your favorites.');
      }
      
      setError(error.message);
      throw error;
    }
  };

  const removeFromFavorites = async (productId) => {
    console.log('🗑️ Removing from favorites:', productId);
    
    const token = getToken();
    if (!isAuthenticated || !token) {
      throw new Error('Please login to remove favorites');
    }

    try {
      const normalizedId = Number(productId);
      const response = await favoriteAPI.removeFromFavorites(normalizedId);
      
      if (response.success) {
        console.log('✅ Removed from favorites successfully');
        await fetchFavorites();
        return response;
      }
      throw new Error(response.message || 'Failed to remove from favorites');
    } catch (error) {
      console.error('❌ Error removing from favorites:', error);
      if (error.message.includes('Authentication')) {
        checkAuthentication();
        throw new Error('Session expired. Please login again.');
      }
      setError(error.message);
      throw error;
    }
  };

  const isFavorite = (productId) => {
    const normalizedId = String(productId);
    return favorites.some(fav => String(fav.productId) === normalizedId);
  };

  const toggleFavorite = async (productId) => {
    console.log('🔀 Toggling favorite:', productId);
    
    if (isFavorite(productId)) {
      return await removeFromFavorites(productId);
    } else {
      return await addToFavorites(productId);
    }
  };

  // Check if a product is in favorites (immediate check without API call)
  const checkFavoriteStatus = (productId) => {
    return isFavorite(productId);
  };

  // Refresh favorites manually
  const refreshFavorites = () => {
    fetchFavorites();
  };

  // Clear error state
  const clearError = () => {
    setError(null);
  };

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('🔄 Auth change detected, refreshing favorites...');
      fetchFavorites();
    };

    window.addEventListener('authStateChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authStateChange', handleAuthChange);
    };
  }, []);

  // Main effect for user/auth changes
  useEffect(() => {
    console.log('👤 User/auth change detected for favorites:', { 
      hasUser: !!user, 
      isAuthenticated,
      userId: user?.id 
    });
    fetchFavorites();
  }, [user, isAuthenticated]);

  const value = {
    // State
    favorites,
    loading,
    error,
    
    // Actions
    fetchFavorites: refreshFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    refreshFavorites,
    clearError,
    
    // Queries
    isFavorite,
    checkFavoriteStatus,
    
    // Helpers
    hasFavorites: favorites.length > 0,
    favoritesCount: favorites.length,
    isAuthenticated, // Pass through for convenience
    
    // Debug info
    debugInfo: {
      userId: user?.id,
      favoritesCount: favorites.length,
      lastUpdated: new Date().toISOString()
    }
  };

  console.log('❤️ FavoriteProvider rendering:', { 
    favoritesCount: favorites.length, 
    loading, 
    hasError: !!error,
    isAuthenticated 
  });

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
};