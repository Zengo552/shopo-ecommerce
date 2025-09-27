// src/components/Helpers/imageUtils.js

/**
 * Get the full product image URL from a filename or partial path
 * @param {string} imagePath - The image filename or partial path from API
 * @returns {string} Full image URL
 */
export const getProductImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL with authentication parameters, return as is
  if (imagePath.startsWith('http') && imagePath.includes('X-Amz-Algorithm')) {
    return imagePath;
  }
  
  // If it's a full URL but missing auth parameters, extract and encode filename
  if (imagePath.startsWith('http')) {
    const url = new URL(imagePath);
    const filename = imagePath.split('/').pop();
    // Recursively process just the filename
    return getProductImageUrl(filename);
  }
  
  // If it's just a filename, URL encode it properly (especially parentheses)
  // The cart API shows: "images(2).jfif" becomes "images%282%29.jfif"
  const encodedFilename = encodeURIComponent(imagePath);
  
  // Construct the full URL with proper encoding
  return `https://usc1.contabostorage.com/ecommerce/${encodedFilename}`;
};

/**
 * Get a fallback image based on product ID
 * @param {number|string} productId - The product ID
 * @returns {string} Fallback image URL
 */
export const getFallbackImage = (productId) => {
  const id = productId || 1;
  const fallbackIndex = (id % 5) || 1;
  return `${import.meta.env.VITE_PUBLIC_URL || ''}/assets/images/product-img-${fallbackIndex}.jpg`;
};

/**
 * Get the best available image for a product with fallback handling
 * @param {Object} product - The product object
 * @returns {string} Image URL
 */
export const getBestProductImage = (product) => {
  if (!product) {
    return getFallbackImage();
  }
  
  // Try different possible image fields in priority order
  const imageFields = ['productImage', 'imageUrl', 'image', 'thumbnail'];
  
  for (const field of imageFields) {
    if (product[field]) {
      const imageUrl = getProductImageUrl(product[field]);
      return imageUrl;
    }
  }
  
  // If no image fields found, use fallback based on product ID
  return getFallbackImage(product.id);
};

/**
 * Alternative: Direct filename encoding for S3 compatibility
 */
export const getS3ImageUrl = (filename) => {
  if (!filename) return null;
  
  if (filename.startsWith('http')) {
    return filename;
  }
  
  // Manual encoding to match exactly what cart API returns
  const encoded = filename
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\s/g, '%20');
  
  return `https://usc1.contabostorage.com/ecommerce/${encoded}`;
};