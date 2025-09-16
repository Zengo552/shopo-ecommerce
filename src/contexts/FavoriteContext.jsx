import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
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
  const { user } = useAuth();
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
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (productId) => {
    try {
      await favoriteAPI.addToFavorites(productId);
      await fetchFavorites(); // Refresh favorites
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  };

  const removeFromFavorites = async (productId) => {
    try {
      await favoriteAPI.removeFromFavorites(productId);
      await fetchFavorites(); // Refresh favorites
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
    isFavorite
  };

  return <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>;
};