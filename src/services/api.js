// src/services/api.js
const API_BASE_URL = 'http://localhost:5521';

// Enhanced API request function with better error handling and auth management
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage with validation
  const token = localStorage.getItem('authToken');
  const hasValidToken = token && token.length > 10; // Basic token validation
  
  console.log('🌐 API Request:', {
    endpoint,
    method: options.method || 'GET',
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    hasValidToken
  });

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(hasValidToken && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // Add timeout to requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(url, { 
      ...defaultOptions, 
      ...options,
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);

    // Handle 401 Unauthorized - clear auth and throw specific error
    if (response.status === 401) {
      console.warn('🔐 401 Unauthorized - clearing auth data');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.dispatchEvent(new Event('authStateChange'));
      throw new Error('Authentication required. Please login again.');
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return { success: true, message: 'Operation completed successfully' };
    }
    
    // Handle cases where response might not be JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ API Error Response:', {
          status: response.status,
          endpoint,
          error: data.message || 'Unknown error'
        });
        throw new Error(data.message || `API request failed with status ${response.status}`);
      }
      
      console.log('✅ API Success Response:', {
        endpoint,
        success: data.success,
        message: data.message || 'No message'
      });
      
      return data;
    } else {
      // For non-JSON responses, return success status
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      return { success: true };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error('⏰ API Request timeout:', endpoint);
      throw new Error('Request timeout. Please try again.');
    }
    
    console.error('❌ API Request error:', {
      endpoint,
      error: error.message,
      type: error.name
    });
    
    // Network errors
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw error;
  }
};

// FIXED: Enhanced Cart APIs with correct parameter format
export const cartAPI = {
  getCart: () => apiRequest('/api/cart'),
  
  // FIXED: Send productId as query parameter instead of request body
  addOrUpdateItem: (cartItem) => {
    const { productId, quantity } = cartItem;
    
    // Validate required parameters
    if (!productId) {
      throw new Error('productId is required');
    }
    
    // Send as query parameters instead of request body
    return apiRequest(`/api/cart/items?productId=${productId}&quantity=${quantity || 1}`, {
      method: 'POST',
      // No body needed - parameters are in URL
    });
  },
  
  updateItemQuantity: (productId, newQuantity) => 
    apiRequest(`/api/cart/items/${productId}?quantity=${newQuantity}`, {
      method: 'PUT',
    }),
  
  removeItem: (productId) => 
    apiRequest(`/api/cart/items/${productId}`, { method: 'DELETE' }),
  
  clearCart: () => 
    apiRequest('/api/cart/clear', { method: 'DELETE' }),

  // Additional cart endpoints
  getCartCount: () => apiRequest('/api/cart/count'),
};

// Enhanced Favorite APIs with better error handling
export const favoriteAPI = {
  getUserFavorites: (pagination = {}) => {
    const params = new URLSearchParams();
    
    // Add pagination parameters
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    return apiRequest(`/favorites?${params.toString()}`);
  },
  
  addToFavorites: (productId) => 
    apiRequest(`/favorites/${productId}`, { method: 'POST' }),
  
  removeFromFavorites: (productId) => 
    apiRequest(`/favorites/${productId}`, { method: 'DELETE' }),

  checkFavorite: (productId) => 
    apiRequest(`/favorites/check/${productId}`),

  // Debug endpoint
  debug: () => apiRequest('/favorites/debug'),
};

// Enhanced Product APIs with better error handling
export const productAPI = {
  getAll: async (filters = {}, pagination = {}) => {
    const params = new URLSearchParams();
    
    // Add filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Convert boolean values to strings
        const stringValue = typeof value === 'boolean' ? value.toString() : value;
        params.append(key, stringValue);
      }
    });
    
    // Add pagination parameters
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    console.log('🔍 Product filters:', Object.fromEntries(params));
    return apiRequest(`/products?${params.toString()}`);
  },
  
  getById: (id) => apiRequest(`/products/${id}`),
  
  getByCategory: (categoryId, pagination = {}) => {
    const params = new URLSearchParams();
    
    // Add pagination parameters
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    return apiRequest(`/products/category/${categoryId}?${params.toString()}`);
  },
  
  search: (keyword, categoryName, minPrice, maxPrice, pagination = {}) => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (categoryName) params.append('categoryName', categoryName);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    
    // Add pagination parameters
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    return apiRequest(`/products/search?${params.toString()}`);
  },
  
  getByName: (name, pagination = {}) => {
    const params = new URLSearchParams();
    params.append('name', encodeURIComponent(name));
    
    // Add pagination parameters
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    return apiRequest(`/products/by-name?${params.toString()}`);
  },

  // Batch operations
  getMultipleByIds: (ids) => 
    apiRequest('/products/batch', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
};

// Enhanced Review APIs
export const reviewAPI = {
  getByProduct: (productId, pagination = {}) => {
    const params = new URLSearchParams();
    
    // Add pagination parameters
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    return apiRequest(`/reviews/product/${productId}?${params.toString()}`);
  },
  
  addReview: (reviewData) => 
    apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
  
  deleteReview: (id) => 
    apiRequest(`/reviews/${id}`, { method: 'DELETE' }),

  updateReview: (id, reviewData) =>
    apiRequest(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    }),
};

// Enhanced Order APIs
export const orderAPI = {
  createOrder: (orderRequest) =>
    apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderRequest),
    }),

  createOrderFromCart: (paymentRequest) =>
    apiRequest('/api/orders/from-cart', {
      method: 'POST',
      body: JSON.stringify(paymentRequest),
    }),

  getOrderById: (id) => apiRequest(`/api/orders/${id}`),

  getOrdersByUserId: (userId) => apiRequest(`/api/orders/user/${userId}`),

  updateOrderStatus: (id, status) =>
    apiRequest(`/api/orders/${id}/status?newStatus=${status}`, {
      method: 'PUT',
    }),

  deleteOrder: (id) =>
    apiRequest(`/api/orders/${id}`, { method: 'DELETE' }),

  // Additional order endpoints
  getUserOrders: () => apiRequest('/api/orders/my-orders'),
  cancelOrder: (id) => apiRequest(`/api/orders/${id}/cancel`, { method: 'PUT' }),
};

// Enhanced TheWallet Payment APIs
export const theWalletAPI = {
  initiatePushUssd: (pushUssdRequest) =>
    apiRequest('/api/thewallet/initiate/push-ussd', {
      method: 'POST',
      body: JSON.stringify(pushUssdRequest),
    }),

  initiateDisbursement: (disbursementRequest) =>
    apiRequest('/api/thewallet/initiate/disbursement', {
      method: 'POST',
      body: JSON.stringify(disbursementRequest),
    }),

  handleCallback: (notification) =>
    apiRequest('/api/thewallet/callback', {
      method: 'POST',
      body: JSON.stringify(notification),
    }),

  checkTransaction: (transactionId) =>
    apiRequest(`/api/thewallet/transaction/${transactionId}`),
};

// Enhanced Category APIs
export const categoryAPI = {
  getAllCategories: (page = 1, limit = 20) =>
    apiRequest(`/api/categories?page=${page}&limit=${limit}`),

  getCategoryById: (id) => apiRequest(`/api/category/${id}`),

  searchCategories: (keyword, page = 1, limit = 20) =>
    apiRequest(`/api/categories/search?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`),

  getAllCategoriesWithoutPagination: () => apiRequest('/api/categories/all'),

  getCategoryProducts: (categoryId, pagination = {}) => {
    const params = new URLSearchParams();
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return apiRequest(`/api/categories/${categoryId}/products?${params.toString()}`);
  },
};

// Enhanced Shop APIs
export const shopAPI = {
  createShop: (shopData, logoFile) => {
    const formData = new FormData();
    formData.append('shop', new Blob([JSON.stringify(shopData)], { type: 'application/json' }));
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    return apiFormRequest('/shops', formData);
  },

  getAllShops: () => apiRequest('/shops/getall'),

  getShopById: (shopId) => apiRequest(`/shops/${shopId}`),

  updateShop: (shopId, shopData, logoFile) => {
    const formData = new FormData();
    formData.append('shop', new Blob([JSON.stringify(shopData)], { type: 'application/json' }));
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    return apiFormRequest(`/shops/${shopId}`, formData, 'PUT');
  },

  deleteShop: (shopId) =>
    apiRequest(`/shops/${shopId}`, { method: 'DELETE' }),

  searchShops: (keyword) =>
    apiRequest(`/shops/search?keyword=${encodeURIComponent(keyword)}`),

  getShopProducts: (shopId, pagination = {}) => {
    const params = new URLSearchParams();
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return apiRequest(`/shops/${shopId}/products?${params.toString()}`);
  },
};

// Enhanced helper function for FormData requests
const apiFormRequest = async (endpoint, formData, method = 'POST') => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');
  const hasValidToken = token && token.length > 10;

  console.log('📤 FormData API Request:', {
    endpoint,
    method,
    hasValidToken,
    formDataKeys: Array.from(formData.keys())
  });

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': hasValidToken ? `Bearer ${token}` : '',
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.dispatchEvent(new Event('authStateChange'));
      throw new Error('Authentication required. Please login again.');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true, message: 'Operation completed successfully' };
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('❌ API FormData request error:', error);
    throw error;
  }
};

// Enhanced utility function to handle API responses consistently
export const handleApiResponse = (response, successCallback, errorCallback) => {
  if (response.success) {
    console.log('✅ API Response handled successfully');
    if (successCallback) successCallback(response);
    return response;
  } else {
    const error = new Error(response.message || 'API request failed');
    console.error('❌ API Response error:', error.message);
    if (errorCallback) errorCallback(error);
    throw error;
  }
};

// Health check utility
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('❌ API Health check failed:', error);
    return false;
  }
};

// Token validation utility
export const validateCurrentToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;
    return !(exp && Date.now() >= exp * 1000);
  } catch (error) {
    return false;
  }
};

export default apiRequest;