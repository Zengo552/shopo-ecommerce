// src/components/Helpers/Cards/ProductCardStyleOne.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthProvider";
import { useCart } from "../../../contexts/CartProvider";
import { useFavorite } from "../../../contexts/FavoriteProvider";
import Compair from "../icons/Compair";
import QuickViewIco from "../icons/QuickViewIco";
import Star from "../icons/Star";
import ThinLove from "../icons/ThinLove";
import ThinBag from "../icons/ThinBag";

export default function ProductCardStyleOne({ datas, type = 1 }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, getItemQuantity } = useCart();
  const { toggleFavorite, isFavorite: checkIsFavorite } = useFavorite();
  
  const [isFavorited, setIsFavorited] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Extract product data
  const productId = datas.id || datas._id;
  const productName = datas.name || datas.title || "Unnamed Product";
  const productPrice = typeof datas.price === 'number' ? datas.price : parseFloat(datas.price || 0);
  const originalPrice = datas.originalPrice || datas.original_price || productPrice;
  const discountPercentage = datas.discountPercentage || datas.discount_percentage || 0;
  const averageRating = datas.averageRating || datas.rating || 0;
  const reviewCount = datas.reviewCount || datas.review_count || 0;
  const stock = datas.stock || datas.quantity || 10; // Default to 10 if stock is missing
  
  // Handle image
  let productImage = `${import.meta.env.VITE_PUBLIC_URL}/assets/images/placeholder-product.png`;
  if (datas.imageUrl) productImage = datas.imageUrl;
  else if (datas.image) productImage = datas.image;
  else if (datas.images && datas.images.length > 0) {
    productImage = typeof datas.images[0] === 'string' ? datas.images[0] : datas.images[0].src;
  } else if (datas.thumbnail) productImage = datas.thumbnail;

  useEffect(() => {
    if (isAuthenticated && user) {
      setIsFavorited(checkIsFavorite(productId));
      setIsInCart(getItemQuantity(productId) > 0);
    } else {
      setIsFavorited(false);
      setIsInCart(false);
    }
  }, [isAuthenticated, user, productId, checkIsFavorite, getItemQuantity]);

  const redirectToLogin = () => {
    sessionStorage.setItem('returnUrl', window.location.pathname);
    navigate('/login');
  };

  const handleAddToFavorites = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated || !user) {
      if (confirm("Please login to add to favorites. Would you like to login now?")) {
        redirectToLogin();
      }
      return;
    }

    setIsTogglingFavorite(true);
    try {
      await toggleFavorite(productId);
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error("Error updating favorites:", error);
      alert("Failed to update favorites. Please try again.");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated || !user) {
      if (confirm("Please login to add to cart. Would you like to login now?")) {
        redirectToLogin();
      }
      return;
    }

    if (stock === 0) {
      alert("This product is out of stock");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(productId, 1);
      setIsInCart(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.message || "Failed to add to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price) => {
    const numPrice = typeof price === 'number' ? price : parseFloat(price || 0);
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  const calculateDiscountPrice = () => {
    if (discountPercentage > 0) {
      return productPrice * (1 - discountPercentage / 100);
    }
    return productPrice;
  };

  const discountedPrice = calculateDiscountPrice();

  const handleImageError = (e) => {
    e.target.src = `${import.meta.env.VITE_PUBLIC_URL}/assets/images/placeholder-product.png`;
    setImageLoaded(true);
  };

  return (
    <div className="product-card-one w-full h-full bg-white relative group overflow-hidden rounded-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      {/* Product Image Container */}
      <div className="product-card-img w-full h-[300px] bg-gray-100 relative overflow-hidden">
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}
        
        {stock === 0 && (
          <div className="absolute top-3 right-3 z-10 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
            Out of Stock
          </div>
        )}
        
        <img
          src={productImage}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
        />

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || stock === 0 || !isAuthenticated || !user}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all transform translate-y-4 group-hover:translate-y-0 ${
              type === 3 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-yellow-500 hover:bg-yellow-600 text-black"
            } ${(isAddingToCart || stock === 0 || !isAuthenticated || !user) ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {!isAuthenticated || !user ? (
              "Login to Add"
            ) : isAddingToCart ? (
              "Adding..."
            ) : stock === 0 ? (
              "Out of Stock"
            ) : isInCart ? (
              "In Cart ✓"
            ) : (
              "Add To Cart"
            )}
          </button>
        </div>
      </div>
      
      {/* Product Details */}
      <div className="product-card-details p-4 relative">
        <Link to={`/single-product/${productId}`}>
          <p className="title mb-2 text-[15px] font-semibold text-qblack leading-[24px] line-clamp-2 hover:text-blue-600 transition-colors">
            {productName}
          </p>
        </Link>
        
        {/* Rating */}
        {averageRating > 0 && (
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(averageRating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="price flex items-center space-x-2">
          <span className="offer-price text-qred font-bold text-[18px]">
            ${formatPrice(discountedPrice)}
          </span>
          {discountPercentage > 0 && (
            <span className="original-price text-gray-400 text-sm line-through">
              ${formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Stock */}
        {stock > 0 && stock < 10 && (
          <p className="text-xs text-orange-500 mt-1">
            Only {stock} left in stock!
          </p>
        )}
      </div>
      
      {/* Quick Access Buttons */}
      <div className="quick-access-btns flex flex-col space-y-2 absolute group-hover:right-3 -right-10 top-3 transition-all duration-300 ease-in-out">
        {/* Quick View */}
        <Link to={`/single-product/${productId}`} onClick={(e) => e.stopPropagation()}>
          <span className="w-10 h-10 flex justify-center items-center bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors group/quickview">
            <QuickViewIco className="w-4 h-4 text-gray-600 group-hover/quickview:text-blue-600" />
          </span>
        </Link>
        
        {/* Favorite */}
        <button 
          onClick={handleAddToFavorites}
          disabled={isTogglingFavorite || !isAuthenticated || !user}
          className="w-10 h-10 flex justify-center items-center bg-white rounded-full shadow-md hover:bg-red-50 transition-colors group/favorite disabled:opacity-50"
          title={!isAuthenticated || !user ? "Login to add favorites" : isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          {isTogglingFavorite ? (
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <ThinLove 
              filled={isFavorited}
              className="w-4 h-4 transition-colors"
              color={isFavorited ? "text-red-600" : "text-gray-600 group-hover/favorite:text-red-500"}
            />
          )}
        </button>
        
        {/* Compare */}
        <button 
          className="w-10 h-10 flex justify-center items-center bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors group/compare"
          title="Compare product"
          onClick={(e) => e.stopPropagation()}
        >
          <Compair className="w-4 h-4 text-gray-600 group-hover/compare:text-green-600" />
        </button>

        {/* Add to Cart (Mobile) */}
        <button 
          onClick={handleAddToCart}
          disabled={isAddingToCart || stock === 0 || !isAuthenticated || !user}
          className="w-10 h-10 flex justify-center items-center bg-white rounded-full shadow-md hover:bg-green-50 transition-colors group/cart disabled:opacity-50 lg:hidden"
          title={!isAuthenticated || !user ? "Login to add to cart" : stock === 0 ? "Out of stock" : isInCart ? "Item in cart" : "Add to cart"}
        >
          {isAddingToCart ? (
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <ThinBag 
              className="w-4 h-4 transition-colors"
              color={isInCart ? "text-green-600" : stock === 0 ? "text-gray-400" : "text-gray-600 group-hover/cart:text-green-500"}
            />
          )}
        </button>
      </div>

      {/* Authentication Status Indicator */}
      {(!isAuthenticated || !user) && (
        <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
          Login Required
        </div>
      )}
    </div>
  );
}