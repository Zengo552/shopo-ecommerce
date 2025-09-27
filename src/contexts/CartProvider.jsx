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
  const { user, isAuthenticated, getToken, checkAuthentication } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [itemCount, setItemCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Create empty cart structure
  const createEmptyCart = () => ({
    id: null,
    userId: user?.id,
    cartItems: [],
    totalAmount: 0,
    subtotal: 0,
    taxAmount: 0,
    shippingCost: 0,
    grandTotal: 0
  });

  // Enhanced cart fetch with retry logic
  const fetchCart = async (forceRetry = false) => {
    console.log('🛒 Fetching cart...', { 
      isAuthenticated, 
      hasUser: !!user,
      userId: user?.id 
    });

    // Double-check authentication using multiple methods
    const token = getToken();
    const hasLocalToken = !!localStorage.getItem('authToken');
    
    if (!isAuthenticated || !user || !token || !hasLocalToken) {
      console.log('🔐 Not authenticated, clearing cart');
      setCart(createEmptyCart());
      setItemCount(0);
      setCartTotal(0);
      setLoading(false);
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Calling cart API...');
      const response = await cartAPI.getCart();
      console.log('📦 Cart API response:', response);

      if (response.success && response.cart) {
        setCart(response.cart);
        const count = response.cart.cartItems?.reduce(
          (total, item) => total + item.quantity,
          0
        ) || 0;
        setItemCount(count);
        setCartTotal(response.cart.totalAmount || response.cart.grandTotal || 0);
        setRetryCount(0); // Reset retry count on success
        console.log('✅ Cart fetched successfully:', { count, total: response.cart.totalAmount });
      } else {
        console.log('⚠️ No cart data, creating empty cart');
        setCart(createEmptyCart());
        setItemCount(0);
        setCartTotal(0);
      }
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      
      // Handle authentication errors specifically
      if (error.message.includes('Authentication') || error.message.includes('401')) {
        setError('Session expired. Please login again.');
        
        // Force re-authentication check
        checkAuthentication();
        
        // Retry once after a short delay if it might be a token sync issue
        if (retryCount < 1 && !forceRetry) {
          console.log('🔄 Retrying cart fetch due to auth error...');
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchCart(true), 1000);
          return;
        }
      } else {
        setError(error.message);
      }
      
      setCart(createEmptyCart());
      setItemCount(0);
      setCartTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced add to cart with better auth handling
  const addToCart = async (productId, quantity = 1) => {
    console.log('➕ Adding to cart:', { productId, quantity });
    
    // Comprehensive auth check
    const token = getToken();
    if (!isAuthenticated || !token) {
      const errorMsg = 'Please login to add items to cart';
      console.warn('🔐 Auth check failed:', errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const normalizedId = Number(productId);
      const normalizedQty = parseInt(quantity, 10);

      if (isNaN(normalizedId) || isNaN(normalizedQty) || normalizedQty < 1) {
        throw new Error('Invalid product ID or quantity');
      }

      console.log('📦 Adding to cart API:', { productId: normalizedId, quantity: normalizedQty });
      const response = await cartAPI.addOrUpdateItem({
        productId: normalizedId,
        quantity: normalizedQty,
      });

      if (response.success) {
        console.log('✅ Add to cart successful, refreshing cart...');
        await fetchCart();
        return response;
      }
      throw new Error(response.message || 'Failed to add to cart');
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      
      // Handle specific error types
      if (error.message.includes('Authentication') || error.message.includes('401')) {
        setError('Session expired during add to cart');
        checkAuthentication();
        throw new Error('Session expired. Please login again.');
      }
      
      if (error.message.includes('stock') || error.message.includes('Stock')) {
        setError('Insufficient stock');
        throw new Error('Insufficient stock available.');
      }
      
      setError(error.message);
      throw error;
    }
  };

  const updateItemQuantity = async (productId, newQuantity) => {
    console.log('✏️ Updating cart quantity:', { productId, newQuantity });
    
    const token = getToken();
    if (!isAuthenticated || !token) {
      throw new Error('Please login to update cart');
    }

    try {
      const normalizedId = Number(productId);
      const normalizedQty = parseInt(newQuantity, 10);

      if (isNaN(normalizedId) || isNaN(normalizedQty) || normalizedQty < 0) {
        throw new Error('Invalid product ID or quantity');
      }

      const response = await cartAPI.updateItemQuantity(normalizedId, normalizedQty);

      if (response.success) {
        await fetchCart();
        return response;
      }
      throw new Error(response.message || 'Failed to update quantity');
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
      if (error.message.includes('Authentication')) {
        checkAuthentication();
        throw new Error('Session expired. Please login again.');
      }
      setError(error.message);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    console.log('🗑️ Removing from cart:', productId);
    
    const token = getToken();
    if (!isAuthenticated || !token) {
      throw new Error('Please login to remove items from cart');
    }

    try {
      const normalizedId = Number(productId);
      const response = await cartAPI.removeItem(normalizedId);
      
      if (response.success) {
        await fetchCart();
        return response;
      }
      throw new Error(response.message || 'Failed to remove from cart');
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
      if (error.message.includes('Authentication')) {
        checkAuthentication();
        throw new Error('Session expired. Please login again.');
      }
      setError(error.message);
      throw error;
    }
  };

  const clearCart = async () => {
    console.log('🧹 Clearing cart...');
    
    const token = getToken();
    if (!isAuthenticated || !token) {
      throw new Error('Please login to clear cart');
    }

    try {
      const response = await cartAPI.clearCart();
      if (response.success) {
        setCart(createEmptyCart());
        setItemCount(0);
        setCartTotal(0);
        return response;
      }
      throw new Error(response.message || 'Failed to clear cart');
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      if (error.message.includes('Authentication')) {
        checkAuthentication();
        throw new Error('Session expired. Please login again.');
      }
      setError(error.message);
      throw error;
    }
  };

  const getCartItem = (productId) => {
    const normalizedId = Number(productId);
    return cart?.cartItems?.find(
      (item) => Number(item.productId) === normalizedId
    );
  };

  const getItemQuantity = (productId) => {
    const item = getCartItem(productId);
    return item ? item.quantity : 0;
  };

  // Refresh cart manually
  const refreshCart = () => {
    fetchCart();
  };

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('🔄 Auth change detected, refreshing cart...');
      fetchCart();
    };

    window.addEventListener('authStateChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authStateChange', handleAuthChange);
    };
  }, []);

  // Main effect for user/auth changes
  useEffect(() => {
    console.log('👤 User/auth change detected:', { 
      hasUser: !!user, 
      isAuthenticated,
      userId: user?.id 
    });
    fetchCart();
  }, [user, isAuthenticated]);

  const value = {
    // State
    cart,
    loading,
    itemCount,
    cartTotal,
    error,
    
    // Actions
    fetchCart: refreshCart,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    clearCart,
    getCartItem,
    getItemQuantity,
    refreshCart,
    
    // Helpers
    isEmpty: itemCount === 0,
    hasItems: itemCount > 0,
    isAuthenticated, // Pass through for convenience
    
    // Debug info
    debugInfo: {
      userId: user?.id,
      cartId: cart?.id,
      itemCount,
      lastUpdated: new Date().toISOString()
    }
  };

  console.log('🛒 CartProvider rendering:', { 
    itemCount, 
    loading, 
    hasError: !!error,
    isAuthenticated 
  });

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};