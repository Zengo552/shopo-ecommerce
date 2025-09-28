// src/pages/ProductView.jsx
import { useState, useMemo } from "react";
import Star from "../Helpers/icons/Star";
import { useCart } from "../../contexts/CartProvider";
import { useAuth } from "../../contexts/AuthProvider";
import { useFavorite } from "../../contexts/FavoriteProvider";
import InputQuantityCom from "../Helpers/InputQuantityCom";

// Top 15 real brands (global brands)
const TOP_BRANDS = [
  "Apple", "Samsung", "Nike", "Adidas", "Sony", 
  "Microsoft", "Google", "Amazon", "LG", "Dell",
  "HP", "Lenovo", "Canon", "Nikon", "Bose"
];

// Product categories matching your application
const PRODUCT_CATEGORIES = {
  "Mobile & Laptops": "Electronics",
  "Gaming Entertainment": "Gaming",
  "Image & Video": "Media",
  "Vehicles": "Vehicles",
  "Furnitures": "Furniture",
  "Sport": "Sports",
  "Food & Drinks": "Food",
  "Fashion Accessories": "Fashion",
  "Toilet & Sanitation": "Toiletries",
  "Makeup Corner": "Makeup",
  "Baby Items": "Baby"
};

export default function ProductView({ product, reportHandler, className }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toggleFavorite, isFavorite: checkIsFavorite } = useFavorite();

  // Memoized product data
  const productData = useMemo(() => {
    const discountedPrice = product.discountPercentage > 0 
      ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
      : product.price;

    const savings = product.discountPercentage > 0 
      ? (product.price - discountedPrice).toFixed(2)
      : 0;

    return {
      discountedPrice,
      savings,
      isOutOfStock: product.stock === 0,
      isLowStock: product.stock > 0 && product.stock < 10
    };
  }, [product]);

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

  // Check if product is favorite
  useState(() => {
    if (isAuthenticated && user) {
      setIsFavorite(checkIsFavorite(product.id));
    }
  }, [isAuthenticated, user, product.id, checkIsFavorite]);

  const handleImageError = (e) => {
    e.target.src = `${import.meta.env.VITE_PUBLIC_URL}/assets/images/placeholder-product.png`;
    setImageLoaded(true);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      alert("Please login to add items to cart");
      return;
    }

    if (productData.isOutOfStock) {
      alert("This product is out of stock");
      return;
    }

    if (quantity > product.stock) {
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

  const handleAddToFavorites = async () => {
    if (!isAuthenticated || !user) {
      alert("Please login to add items to favorites");
      return;
    }

    setFavoriteLoading(true);
    try {
      await toggleFavorite(product.id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error updating favorites:", error);
      alert("Failed to update favorites. Please try again.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const shareProduct = () => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${product.name} for $${productData.discountedPrice}`;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Product link copied to clipboard!");
    }
  };

  const getStockStatus = () => {
    if (productData.isOutOfStock) {
      return { text: "Out of Stock", class: "text-red-600 bg-red-100" };
    }
    if (productData.isLowStock) {
      return { text: `Only ${product.stock} left`, class: "text-orange-600 bg-orange-100" };
    }
    return { text: "In Stock", class: "text-green-600 bg-green-100" };
  };

  const stockStatus = getStockStatus();

  // Get category display name
  const getCategoryDisplayName = () => {
    if (!product.category) return "Product";
    
    // Find matching category name
    const categoryEntry = Object.entries(PRODUCT_CATEGORIES).find(
      ([_, value]) => value === product.category
    );
    
    return categoryEntry ? categoryEntry[0] : product.category;
  };

  return (
    <div className={`product-view w-full lg:flex justify-between ${className || ""}`}>
      {/* Product images */}
      <div data-aos="fade-right" className="lg:w-1/2 xl:mr-[70px] lg:mr-[50px]">
        <div className="w-full">
          <div className="w-full h-[600px] border border-qgray-border flex justify-center items-center overflow-hidden relative mb-3 bg-white rounded-lg">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <img
              src={images[selectedImage]?.src}
              alt={images[selectedImage]?.alt || product.name}
              className="object-contain max-h-full max-w-full transition-transform duration-300 hover:scale-105"
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
            />
            
            {/* Badges container */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {/* Discount badge */}
              {product.discountPercentage > 0 && (
                <div className="w-16 h-16 rounded-full bg-qyellow text-qblack flex justify-center items-center text-sm font-bold">
                  -{product.discountPercentage}%
                </div>
              )}
              
              {/* New badge */}
              {product.isNew && (
                <div className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  New
                </div>
              )}
            </div>
            
            {/* Stock status badge - Only show for low stock, hide for out of stock */}
            {productData.isLowStock && (
              <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full ${stockStatus.class}`}>
                {stockStatus.text}
              </div>
            )}
          </div>
          
          {/* Image thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 flex-wrap mt-4">
              {images.map((img, index) => (
                <button
                  onClick={() => setSelectedImage(index)}
                  key={img.id || index}
                  className={`w-20 h-20 p-2 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedImage === index 
                      ? 'border-qyellow bg-yellow-50' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.alt || `${product.name} view ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Product details */}
      <div className="flex-1">
        <div className="product-details w-full mt-10 lg:mt-0">
          {/* Category and Brand */}
          <div className="flex items-center gap-4 mb-3">
            <span className="text-qgray text-xs font-normal uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
              {getCategoryDisplayName()}
            </span>
            {product.brand && TOP_BRANDS.includes(product.brand) && (
              <span className="text-xs font-normal text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                {product.brand}
              </span>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-qblack mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Rating and Stock */}
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.averageRating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-qblack">
                {product.averageRating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-sm text-gray-500">
                ({product.reviewCount || 0} Reviews)
              </span>
            </div>
            
            {/* Stock status - Only show for low stock, hide for out of stock */}
            {productData.isLowStock && (
              <div className={`px-3 py-1 text-xs font-semibold rounded-full ${stockStatus.class}`}>
                {stockStatus.text}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-4xl font-bold text-qred">
              ${productData.discountedPrice}
            </span>
            
            {product.discountPercentage > 0 && (
              <>
                <span className="text-xl font-medium text-gray-400 line-through">
                  ${product.price?.toFixed(2)}
                </span>
                <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full font-semibold">
                  Save ${productData.savings}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-700 text-base leading-relaxed">
              {product.description || "No description available."}
            </p>
          </div>

          {/* Add to cart section */}
          {!productData.isOutOfStock ? (
            <>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="sm:w-32">
                  <InputQuantityCom
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    maxQuantity={product.stock}
                    disabled={loading}
                  />
                </div>
                
                <div className="flex-1 flex gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={loading || !isAuthenticated || !user}
                    className={`flex-1 bg-qblack text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                      loading ? 'opacity-70' : ''
                    }`}
                  >
                    {!isAuthenticated || !user ? (
                      "Login to Add to Cart"
                    ) : loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding...
                      </div>
                    ) : (
                      'Add To Cart'
                    )}
                  </button>
                  
                  <button
                    onClick={handleAddToFavorites}
                    disabled={favoriteLoading || !isAuthenticated || !user}
                    className="w-12 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    {favoriteLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mx-auto"></div>
                    ) : (
                      <svg 
                        className={`w-5 h-5 mx-auto ${isFavorite ? 'text-red-500 fill-current' : ''}`}
                        fill={isFavorite ? "currentColor" : "none"}
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-6 mb-6">
                <button
                  type="button"
                  className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
                  onClick={reportHandler}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Report Product
                </button>
                
                <button
                  onClick={shareProduct}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Product
                </button>
              </div>
            </>
          ) : (
            <div className="bg-gray-100 p-6 rounded-lg mb-6">
              <p className="text-gray-600">This product is not available at the moment. Check back later or browse similar items.</p>
            </div>
          )}

          {/* Product details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-sm">
                  <span className="font-medium text-gray-900">Category:</span>{' '}
                  <span className="text-gray-600">{getCategoryDisplayName()}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900">SKU:</span>{' '}
                  <span className="text-gray-600">{product.sku || "N/A"}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900">Brand:</span>{' '}
                  <span className="text-gray-600">{product.brand || "N/A"}</span>
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-sm">
                  <span className="font-medium text-gray-900">Availability:</span>{' '}
                  <span className={`font-semibold ${stockStatus.class.split(' ')[0]}`}>
                    {stockStatus.text === "Out of Stock" ? "Currently Unavailable" : stockStatus.text}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900">Warranty:</span>{' '}
                  <span className="text-gray-600">{product.warranty || "1 year"}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900">Shipping:</span>{' '}
                  <span className="text-gray-600">Free shipping on orders over $50</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}