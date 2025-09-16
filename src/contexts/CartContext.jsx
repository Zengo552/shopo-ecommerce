import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [itemCount, setItemCount] = useState(0);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      setItemCount(0);
      setLoading(false);
      return;
    }

    try {
      const response = await cartAPI.getCart();
      if (response.success) {
        setCart(response.cart);
        setItemCount(response.cart?.cartItems?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await cartAPI.addOrUpdateItem({ productId, quantity });
      await fetchCart(); // Refresh cart data
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartAPI.removeItem(productId);
      await fetchCart(); // Refresh cart data
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const value = {
    cart,
    loading,
    itemCount,
    fetchCart,
    addToCart,
    removeFromCart,
    clearCart: () => setCart(null)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};