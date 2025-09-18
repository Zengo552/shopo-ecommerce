// src/helpers/imageUtils.js
export const getProductImageUrl = (product) => {
  if (!product) return `${import.meta.env.VITE_PUBLIC_URL}/assets/images/default-product.jpg`;
  
  // Check multiple possible image field names
  if (product.imageUrl) return product.imageUrl;
  if (product.productImage) return product.productImage;
  if (product.image) return product.image;
  if (product.thumbnail) return product.thumbnail;
  if (product.images && product.images.length > 0) {
    return typeof product.images[0] === 'string' 
      ? product.images[0] 
      : product.images[0].url || product.images[0].src;
  }
  
  return `${import.meta.env.VITE_PUBLIC_URL}/assets/images/default-product.jpg`;
};