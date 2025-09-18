// src/contexts/CartProvider.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
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
  const [cartTotal, setCartTotal] = useState(0);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      setItemCount(0);
      setCartTotal(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      if (response.success) {
        setCart(response.cart);
        const count = response.cart?.cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;
        setItemCount(count);
        setCartTotal(response.cart?.totalAmount || 0);
      } else {
        // If cart doesn't exist, create an empty cart structure
        setCart({
          id: null,
          userId: user.id,
          cartItems: [],
          totalAmount: 0
        });
        setItemCount(0);
        setCartTotal(0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Create empty cart on error
      setCart({
        id: null,
        userId: user.id,
        cartItems: [],
        totalAmount: 0
      });
      setItemCount(0);
      setCartTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await cartAPI.addOrUpdateItem({ productId, quantity });
      if (response.success) {
        await fetchCart(); // Refresh cart data
        return response;
      }
      throw new Error(response.message || 'Failed to add to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateItemQuantity = async (productId, newQuantity) => {
    try {
      const response = await cartAPI.updateItemQuantity(productId, newQuantity);
      if (response.success) {
        await fetchCart(); // Refresh cart data
        return response;
      }
      throw new Error(response.message || 'Failed to update quantity');
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await cartAPI.removeItem(productId);
      if (response.success) {
        await fetchCart(); // Refresh cart data
        return response;
      }
      throw new Error(response.message || 'Failed to remove from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const response = await cartAPI.clearCart();
      if (response.success) {
        setCart({
          id: null,
          userId: user?.id,
          cartItems: [],
          totalAmount: 0
        });
        setItemCount(0);
        setCartTotal(0);
        return response;
      }
      throw new Error(response.message || 'Failed to clear cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const updateCartCount = (increment = 1) => {
    setItemCount(prev => Math.max(0, prev + increment));
  };

  const getCartItem = (productId) => {
    return cart?.cartItems?.find(item => item.productId === productId);
  };

  const getItemQuantity = (productId) => {
    const item = getCartItem(productId);
    return item ? item.quantity : 0;
  };

  // Refresh cart when user changes
  useEffect(() => {
    fetchCart();
  }, [user]);

  const value = {
    // State
    cart,
    loading,
    itemCount,
    cartTotal,
    
    // Actions
    fetchCart,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    clearCart,
    updateCartCount,
    getCartItem,
    getItemQuantity,
    
    // Helper flags
    isEmpty: itemCount === 0,
    hasItems: itemCount > 0
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};