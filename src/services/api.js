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

    // Handle 404 - Endpoint not found
    if (response.status === 404) {
      console.warn('🔍 404 Endpoint not found:', endpoint);
      throw new Error(`API endpoint not found: ${endpoint}`);
    }

    // Handle 500 - Server error
    if (response.status === 500) {
      console.error('💥 500 Server error for endpoint:', endpoint);
      throw new Error(`Server error: ${endpoint}`);
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

// Enhanced Review APIs with complete functionality
export const reviewAPI = {
  // Get reviews for a product with pagination and filtering
  getByProduct: (productId, pagination = {}) => {
    const params = new URLSearchParams();
    
    // Add pagination parameters
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    return apiRequest(`/api/reviews/product/${productId}?${params.toString()}`);
  },
  
  // Add a new review
  addReview: (reviewData) => 
    apiRequest('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
  
  // Update an existing review
  updateReview: (id, reviewData) =>
    apiRequest(`/api/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    }),
  
  // Delete a review
  deleteReview: (id) => 
    apiRequest(`/api/reviews/${id}`, { method: 'DELETE' }),

  // Get review statistics for a product
  getReviewStats: (productId) =>
    apiRequest(`/api/reviews/product/${productId}/stats`),

  // Check if user has reviewed a product
  checkUserReview: (productId, userEmail) => {
    const params = new URLSearchParams();
    if (userEmail) params.append('userEmail', userEmail);
    
    return apiRequest(`/api/reviews/product/${productId}/check?${params.toString()}`);
  },

  // Get reviews by user email (FIXED: using the correct endpoint)
  getByUserEmail: (userEmail, pagination = {}) => {
    const params = new URLSearchParams();
    
    // Add pagination parameters
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    return apiRequest(`/api/reviews/user/email/${encodeURIComponent(userEmail)}?${params.toString()}`);
  },

  // Get reviews by user ID
  getByUserId: (userId, pagination = {}) => {
    const params = new URLSearchParams();
    
    // Add pagination parameters
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    return apiRequest(`/api/reviews/user/id/${userId}?${params.toString()}`);
  },

  // Get recent reviews across all products
  getRecentReviews: (limit = 10) =>
    apiRequest(`/api/reviews/recent?limit=${limit}`),

  // Get reviews by user (alias - uses email by default)
  getByUser: (userIdentifier, pagination = {}) => {
    // Determine if identifier is email or ID
    if (typeof userIdentifier === 'string' && userIdentifier.includes('@')) {
      return reviewAPI.getByUserEmail(userIdentifier, pagination);
    } else {
      return reviewAPI.getByUserId(userIdentifier, pagination);
    }
  },
};

// Enhanced Product APIs with review integration
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

  // Product review statistics
  getProductsWithReviewStats: (pagination = {}) => {
    const params = new URLSearchParams();
    
    // Add pagination parameters
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    return apiRequest(`/products/with-review-stats?${params.toString()}`);
  },

  // Create product with image upload
  createProduct: (productData, imageFile) => {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return apiFormRequest('/products', formData);
  },

  // Update product with optional image upload
  updateProduct: (id, productData, imageFile) => {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return apiFormRequest(`/products/${id}`, formData, 'PUT');
  },

  // Delete product
  deleteProduct: (id) => 
    apiRequest(`/products/${id}`, { method: 'DELETE' }),
};

// Enhanced Cart APIs with correct parameter format
export const cartAPI = {
  getCart: () => apiRequest('/api/cart'),
  
  // Send productId as query parameter instead of request body
  addOrUpdateItem: (cartItem) => {
    const { productId, quantity } = cartItem;
    
    // Validate required parameters
    if (!productId) {
      throw new Error('productId is required');
    }
    
    // Send as query parameters instead of request body
    return apiRequest(`/api/cart/items?productId=${productId}&quantity=${quantity || 1}`, {
      method: 'POST',
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

  // Order reviews - check if user can review purchased products
  getReviewableProducts: (orderId) =>
    apiRequest(`/api/orders/${orderId}/reviewable-products`),
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

  // Shop reviews
  getShopReviews: (shopId, pagination = {}) => {
    const params = new URLSearchParams();
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return apiRequest(`/shops/${shopId}/reviews?${params.toString()}`);
  },
};

// Enhanced User APIs with review integration
export const userAPI = {
  getUserProfile: (userId) => apiRequest(`/api/users/${userId}`),
  
  updateUserProfile: (userId, userData) =>
    apiRequest(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  // User review history
  getUserReviews: (userId, pagination = {}) => {
    const params = new URLSearchParams();
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return apiRequest(`/api/users/${userId}/reviews?${params.toString()}`);
  },

  // User's purchased products available for review
  getReviewableProducts: (userId) =>
    apiRequest(`/api/users/${userId}/reviewable-products`),
};

// Enhanced Auth APIs
export const authAPI = {
  login: (credentials) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),

  refreshToken: () => apiRequest('/api/auth/refresh', { method: 'POST' }),

  verifyEmail: (token) => apiRequest(`/api/auth/verify-email?token=${token}`),

  forgotPassword: (email) =>
    apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, newPassword) =>
    apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
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

    // Handle 404 - Endpoint not found
    if (response.status === 404) {
      console.warn('🔍 404 Endpoint not found:', endpoint);
      throw new Error(`API endpoint not found: ${endpoint}`);
    }

    // Handle 500 - Server error
    if (response.status === 500) {
      console.error('💥 500 Server error for endpoint:', endpoint);
      throw new Error(`Server error: ${endpoint}`);
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

// Review-specific utilities
export const reviewUtils = {
  // Calculate average rating from reviews array
  calculateAverageRating: (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  },

  // Get rating distribution
  getRatingDistribution: (reviews) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });
    
    return distribution;
  },

  // Format review date
  formatReviewDate: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Validate review data before submission
  validateReviewData: (reviewData) => {
    const errors = [];
    
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      errors.push('Please select a valid rating (1-5 stars)');
    }
    
    if (!reviewData.userName || reviewData.userName.trim().length < 2) {
      errors.push('Please enter your name (minimum 2 characters)');
    }
    
    if (!reviewData.userEmail || !/\S+@\S+\.\S+/.test(reviewData.userEmail)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!reviewData.comment || reviewData.comment.trim().length < 10) {
      errors.push('Please write a review with at least 10 characters');
    }
    
    if (reviewData.comment && reviewData.comment.trim().length > 1000) {
      errors.push('Review comment cannot exceed 1000 characters');
    }
    
    return errors;
  }
};

// Enhanced error handling for wishlist and reviews
export const wishlistUtils = {
  // Transform API response to consistent format
  transformWishlistData: (apiResponse) => {
    if (!apiResponse || !apiResponse.data) return [];
    
    return apiResponse.data.map(item => ({
      id: item.id,
      productId: item.productId || item.product?.id,
      product: {
        id: item.product?.id,
        name: item.product?.name || item.product?.title,
        title: item.product?.title || item.product?.name,
        price: item.product?.price || item.product?.unitPrice,
        image: item.product?.image || item.product?.imageUrl,
        category: item.product?.category?.name || item.product?.categoryName,
        stockStatus: item.product?.stockStatus || 'IN_STOCK',
        stockQuantity: item.product?.stockQuantity || item.product?.quantity
      },
      quantity: item.quantity || 1,
      createdAt: item.createdAt
    }));
  }
};

export const reviewDataUtils = {
  // Transform API response to consistent format
  transformReviewsData: (apiResponse) => {
    if (!apiResponse || !apiResponse.reviews) return [];
    
    return apiResponse.reviews.map(review => ({
      id: review.id,
      productId: review.productId,
      product: {
        id: review.product?.id,
        name: review.product?.name || review.product?.title,
        title: review.product?.title || review.product?.name,
        image: review.product?.image || review.product?.imageUrl
      },
      rating: review.rating || review.stars,
      title: review.title,
      comment: review.comment || review.content,
      status: review.status || 'APPROVED',
      createdAt: review.createdAt || review.date,
      userEmail: review.userEmail,
      userName: review.userName
    }));
  }
};

// Enhanced API functions with better error handling
export const enhancedFavoriteAPI = {
  ...favoriteAPI,
  getUserFavorites: async () => {
    try {
      const response = await favoriteAPI.getUserFavorites();
      return {
        ...response,
        data: wishlistUtils.transformWishlistData(response)
      };
    } catch (error) {
      console.error('Enhanced favorite API error:', error);
      throw error;
    }
  }
};

export const enhancedReviewAPI = {
  ...reviewAPI,
  getByUserEmail: async (userEmail) => {
    try {
      const response = await reviewAPI.getByUserEmail(userEmail);
      return {
        ...response,
        data: reviewDataUtils.transformReviewsData(response)
      };
    } catch (error) {
      console.error('Enhanced review API error:', error);
      throw error;
    }
  },
  
  getByUserId: async (userId) => {
    try {
      const response = await reviewAPI.getByUserId(userId);
      return {
        ...response,
        data: reviewDataUtils.transformReviewsData(response)
      };
    } catch (error) {
      console.error('Enhanced review API error:', error);
      throw error;
    }
  }
};

// Fallback API methods for missing endpoints
export const fallbackAPI = {
  // Fallback for user reviews if specific endpoints don't exist
  getUserReviews: async (userEmail) => {
    try {
      console.warn('Using fallback method for user reviews - consider implementing proper endpoint');
      
      // Try to get all recent reviews and filter by user
      const response = await reviewAPI.getRecentReviews(100);
      if (response.success && response.reviews) {
        const userReviews = response.reviews.filter(review => 
          review.userEmail === userEmail
        );
        
        return {
          success: true,
          message: 'User reviews retrieved successfully',
          reviews: userReviews,
          totalReviews: userReviews.length
        };
      }
      return {
        success: false,
        message: 'Failed to fetch user reviews',
        reviews: [],
        totalReviews: 0
      };
    } catch (error) {
      console.error('Fallback API error:', error);
      return {
        success: false,
        message: error.message,
        reviews: [],
        totalReviews: 0
      };
    }
  }
};

export default apiRequest;