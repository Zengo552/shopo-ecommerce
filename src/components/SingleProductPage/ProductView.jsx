// src/pages/ProductView.jsx
import { useState } from "react";
import Star from "../Helpers/icons/Star";
import { useCart } from "../../contexts/CartProvider";
import { useAuth } from "../../contexts/AuthProvider";
import InputQuantityCom from "../Helpers/InputQuantityCom";

export default function ProductView({ product, reportHandler, className }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  // Handle image URLs
  const getImageUrl = (image) => {
    if (!image) return `${import.meta.env.VITE_PUBLIC_URL}/assets/images/placeholder-product.png`;
    
    if (image.startsWith('http')) return image;
    if (image.startsWith('/')) return `${import.meta.env.VITE_PUBLIC_URL}${image}`;
    return `${import.meta.env.VITE_PUBLIC_URL}/assets/images/${image}`;
  };

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
    }
    return [{ id: 0, src: `${import.meta.env.VITE_PUBLIC_URL}/assets/images/placeholder-product.png`, alt: product.name }];
  };

  const images = getProductImages();

  const handleImageError = (e) => {
    e.target.src = `${import.meta.env.VITE_PUBLIC_URL}/assets/images/placeholder-product.png`;
    setImageLoaded(true);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      alert("Please login to add items to cart");
      return;
    }

    if (!product.stock || product.stock === 0) {
      alert("This product is out of stock");
      return;
    }

    if (quantity > (product.stock || 99)) {
      alert(`Only ${product.stock} items available in stock`);
      return;
    }

    setLoading(true);
    try {
      await addToCart(product.id, quantity);
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.message || "Failed to add to cart. Please try again.");
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
                  maxQuantity={product.stock}
                  disabled={loading}
                />
                
                <div className="flex-1 h-full">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={loading || !isAuthenticated || !user}
                    className={`black-btn text-sm font-semibold w-full h-full transition-all duration-200 ${
                      (loading || !isAuthenticated || !user) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-qblack'
                    }`}
                  >
                    {!isAuthenticated || !user ? (
                      "Login to Add to Cart"
                    ) : loading ? (
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
          </div>
        </div>
      </div>
    </div>
  );
}