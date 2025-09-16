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
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    // Return the full response, not just data
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
    
    const response = await apiRequest(`/products?${params.toString()}`);
    return response; // Return the full response
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

// Favorite APIs with pagination support
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
};

// Review APIs with pagination support
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

// Cart APIs (pagination not typically needed for cart)
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

export default apiRequest;