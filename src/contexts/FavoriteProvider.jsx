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
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await favoriteAPI.getUserFavorites();
      if (response.success) {
        setFavorites(response.favorites || response.data || []);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError(error.message);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add favorites');
    }

    try {
      const response = await favoriteAPI.addToFavorites(productId);
      if (response.success) {
        await fetchFavorites(); // Refresh favorites
        return response;
      }
      throw new Error(response.message || 'Failed to add to favorites');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      setError(error.message);
      throw error;
    }
  };

  const removeFromFavorites = async (productId) => {
    try {
      const response = await favoriteAPI.removeFromFavorites(productId);
      if (response.success) {
        await fetchFavorites(); // Refresh favorites
        return response;
      }
      throw new Error(response.message || 'Failed to remove from favorites');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      setError(error.message);
      throw error;
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(fav => fav.productId === parseInt(productId));
  };

  const toggleFavorite = async (productId) => {
    if (isFavorite(productId)) {
      return await removeFromFavorites(productId);
    } else {
      return await addToFavorites(productId);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user, isAuthenticated]);

  const value = {
    favorites,
    loading,
    error,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    hasFavorites: favorites.length > 0,
    favoritesCount: favorites.length
  };

  return <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>;
};