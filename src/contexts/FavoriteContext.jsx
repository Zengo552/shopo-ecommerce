// src/contexts/FavoriteContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider'; // Make sure this import is correct
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
  const { user } = useAuth(); // This will work now since AuthProvider wraps this
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const response = await favoriteAPI.getUserFavorites();
      if (response.success) {
        setFavorites(response.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (productId) => {
    try {
      const response = await favoriteAPI.addToFavorites(productId);
      if (response.success) {
        await fetchFavorites(); // Refresh favorites
        return response;
      }
      throw new Error(response.message || 'Failed to add to favorites');
    } catch (error) {
      console.error('Error adding to favorites:', error);
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
      throw error;
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(fav => fav.productId === productId);
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const value = {
    favorites,
    loading,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    hasFavorites: favorites.length > 0,
    favoritesCount: favorites.length
  };

  return <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>;
};