// src/services/api.js
const API_BASE_URL = 'http://localhost:5521';

// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    // Handle 204 No Content responses
    if (response.status === 204) {
      return { success: true, message: 'Operation completed successfully' };
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `API request failed with status ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Product APIs with pagination support
export const productAPI = {
  getAll: async (filters = {}, pagination = {}) => {
    const params = new URLSearchParams();
    
    // Add filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    // Add pagination parameters
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
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
};

// Favorite APIs - Updated to match backend structure
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

  // Debug endpoint
  debug: () => apiRequest('/favorites/debug'),
};

// Review APIs - Updated to match backend structure
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
};

// Cart APIs - Updated to match CartController
export const cartAPI = {
  getCart: () => apiRequest('/api/cart'),
  
  addOrUpdateItem: (cartItem) => 
    apiRequest('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify(cartItem),
    }),
  
  updateItemQuantity: (productId, newQuantity) => 
    apiRequest(`/api/cart/items/${productId}?quantity=${newQuantity}`, {
      method: 'PUT',
    }),
  
  removeItem: (productId) => 
    apiRequest(`/api/cart/items/${productId}`, { method: 'DELETE' }),
  
  clearCart: () => 
    apiRequest('/api/cart/clear', { method: 'DELETE' }),
};

// Order APIs
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
};

// TheWallet Payment APIs
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
};

// Category APIs
export const categoryAPI = {
  getAllCategories: (page = 1, limit = 20) =>
    apiRequest(`/api/categories?page=${page}&limit=${limit}`),

  getCategoryById: (id) => apiRequest(`/api/category/${id}`),

  searchCategories: (keyword, page = 1, limit = 20) =>
    apiRequest(`/api/categories/search?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`),

  getAllCategoriesWithoutPagination: () => apiRequest('/api/categories/all'),
};

// Shop APIs
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
};

// Helper function for FormData requests
const apiFormRequest = async (endpoint, formData, method = 'POST') => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

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
    console.error('API form request error:', error);
    throw error;
  }
};

// Utility function to handle API responses consistently
export const handleApiResponse = (response, successCallback, errorCallback) => {
  if (response.success) {
    if (successCallback) successCallback(response);
    return response;
  } else {
    const error = new Error(response.message || 'API request failed');
    if (errorCallback) errorCallback(error);
    throw error;
  }
};

export default apiRequest;