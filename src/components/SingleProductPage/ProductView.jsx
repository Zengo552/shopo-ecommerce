// src/pages/ProductView.jsx
import { useState } from "react";
import Star from "../Helpers/icons/Star";
import { cartAPI } from "../../services/api";
import { useCart } from "../../contexts/CartProvider";
import { Toast } from "../Helpers/Toast";
import InputQuantityCom from "../Helpers/InputQuantityCom";

export default function ProductView({ product, reportHandler, className }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart, itemCount } = useCart();

  // Handle image URLs - same approach as ProductCardStyleOne
  const getImageUrl = (image) => {
    if (!image) return `${import.meta.env.VITE_PUBLIC_URL}/assets/images/placeholder-product.png`;
    
    if (image.startsWith('http')) return image;
    if (image.startsWith('/')) return `${import.meta.env.VITE_PUBLIC_URL}${image}`;
    return `${import.meta.env.VITE_PUBLIC_URL}/assets/images/${image}`;
  };

  // Handle different image property structures - same as ProductCardStyleOne
  const getProductImages = () => {
    if (product.images && product.images.length > 0) {
      return product.images.map((img, index) => ({
        id: index,
        src: typeof img === 'string' ? getImageUrl(img) : getImageUrl(img.src || img.url),
        alt: product.name
      }));
    } else if (product.image) {
      return [{ id: 0, src: getImageUrl(product.image), alt: product.name }];
    } else if (product.imageUrl) {
      return [{ id: 0, src: getImageUrl(product.imageUrl), alt: product.name }];
    } else if (product.thumbnail) {
      return [{ id: 0, src: getImageUrl(product.thumbnail), alt: product.name }];
    }
    return [{ id: 0, src: `${import.meta.env.VITE_PUBLIC_URL}/assets/images/placeholder-product.png`, alt: product.name }];
  };

  const images = getProductImages();

  const handleImageError = (e) => {
    e.target.src = `${import.meta.env.VITE_PUBLIC_URL}/assets/images/placeholder-product.png`;
    setImageLoaded(true);
  };

  const handleAddToCart = async () => {
    if (!product.stock || product.stock === 0) {
      Toast.error("This product is out of stock");
      return;
    }

    if (quantity > (product.stock || 99)) {
      Toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    setLoading(true);
    try {
      await addToCart(product.id, quantity);
      Toast.success("Product added to cart successfully!");
      
      // Reset quantity after successful add
      setQuantity(1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      Toast.error(error.message || "Failed to add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const discountedPrice = product.discountPercentage > 0 
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    : product.price;

  const isOutOfStock = product.stock === 0;

  return (
    <div className={`product-view w-full lg:flex justify-between ${className || ""}`}>
      {/* Product images */}
      <div data-aos="fade-right" className="lg:w-1/2 xl:mr-[70px] lg:mr-[50px]">
        <div className="w-full">
          <div className="w-full h-[600px] border border-qgray-border flex justify-center items-center overflow-hidden relative mb-3 bg-white">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <img
              src={images[selectedImage]?.src}
              alt={images[selectedImage]?.alt || product.name}
              className="object-contain max-h-full max-w-full transition-transform duration-300 group-hover:scale-105"
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
            />
            
            {/* Discount badge */}
            {product.discountPercentage > 0 && (
              <div className="w-[80px] h-[80px] rounded-full bg-qyellow text-qblack flex justify-center items-center text-xl font-medium absolute left-[30px] top-[30px] z-10">
                <span>-{product.discountPercentage}%</span>
              </div>
            )}
            
            {/* Out of stock badge */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white px-4 py-2 rounded-lg text-red-600 font-semibold">
                  Out of Stock
                </div>
              </div>
            )}
          </div>
          
          {/* Image thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap mt-4">
              {images.map((img, index) => (
                <div
                  onClick={() => setSelectedImage(index)}
                  key={img.id || index}
                  className={`w-[110px] h-[110px] p-[15px] border cursor-pointer transition-all duration-200 ${
                    selectedImage === index 
                      ? 'border-qyellow border-2' 
                      : 'border-qgray-border hover:border-qgray'
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.alt || `${product.name} view ${index + 1}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = `${import.meta.env.VITE_PUBLIC_URL}/assets/images/placeholder-product.png`;
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Product details */}
      <div className="flex-1">
        <div className="product-details w-full mt-10 lg:mt-0">
          <span className="text-qgray text-xs font-normal uppercase tracking-wider mb-2 inline-block">
            {product.category?.name || "Product"}
          </span>
          
          <h1 className="text-2xl font-semibold text-qblack mb-4">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex space-x-[10px] items-center mb-6">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.averageRating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[13px] font-normal text-qblack">
              {product.reviewCount || 0} Reviews
            </span>
            {product.stock > 0 && (
              <span className="text-[13px] font-normal text-green-600 ml-4">
                {product.stock} in stock
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex space-x-2 items-center mb-7">
            {product.discountPercentage > 0 && (
              <span className="text-lg font-500 text-qgray line-through">
                ${product.price?.toFixed(2)}
              </span>
            )}
            <span className="text-3xl font-bold text-qred">
              ${discountedPrice}
            </span>
            {product.discountPercentage > 0 && (
              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                Save ${(product.price - discountedPrice).toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-qgray text-sm text-normal mb-[30px] leading-7">
            {product.description || "No description available."}
          </p>

          {/* Add to cart section */}
          {!isOutOfStock ? (
            <>
              <div className="quantity-card-wrapper w-full flex items-center h-[50px] space-x-[10px] mb-[30px]">
                <InputQuantityCom
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                />
                
                <div className="flex-1 h-full">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={loading}
                    className={`black-btn text-sm font-semibold w-full h-full transition-all duration-200 ${
                      loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-qblack'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </div>
                    ) : (
                      'Add To Cart'
                    )}
                  </button>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex space-x-4 mb-6">
                <button
                  type="button"
                  className="flex items-center text-qgray hover:text-qblack transition-colors"
                  onClick={reportHandler}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Report Product
                </button>
              </div>
            </>
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <p className="text-red-600 font-semibold mb-2">Out of Stock</p>
              <p className="text-sm text-gray-600">This product is currently unavailable.</p>
            </div>
          )}

          {/* Product details */}
          <div className="mb-[20px] space-y-2">
            <p className="text-[13px] text-qgray">
              <span className="text-qblack font-medium">Category:</span> {product.category?.name || "N/A"}
            </p>
            <p className="text-[13px] text-qgray">
              <span className="text-qblack font-medium">SKU:</span> {product.sku || "N/A"}
            </p>
            <p className="text-[13px] text-qgray">
              <span className="text-qblack font-medium">Brand:</span> {product.brand || "N/A"}
            </p>
            {product.weight && (
              <p className="text-[13px] text-qgray">
                <span className="text-qblack font-medium">Weight:</span> {product.weight}
              </p>
            )}
          </div>

          {/* Social sharing */}
          <div className="social-share flex items-center w-full pt-4 border-t border-gray-200">
            <span className="text-qblack text-[13px] mr-4">
              Share This:
            </span>
            <div className="flex space-x-3">
              <button className="text-gray-600 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c极速线上娱乐"/>
                </svg>
              </button>
              <button className="text-gray-600 hover:text-blue-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10 10 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 极速线上娱乐"/>
                </svg>
              </button>
              <button className="text极速线上娱乐-gray-600 hover:text-red-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.极速线上娱乐07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8极速线上娱乐.333 23.986 8.741 24 极速线上娱乐12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}