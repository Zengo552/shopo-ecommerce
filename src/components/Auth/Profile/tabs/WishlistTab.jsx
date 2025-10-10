import React, { useState } from "react";
import { getProductImageUrl } from "../../../Helpers/imageUtils";

export default function WishlistTab({ 
  className, 
  wishlistData = [], 
  loading = false, 
  error = null, 
  onRefresh,
  onWishlistUpdate 
}) {
  const [processingItems, setProcessingItems] = useState(new Set());
  const [cartLoading, setCartLoading] = useState(new Set());

  const handleRemoveFromWishlist = async (productId) => {
    if (processingItems.has(productId)) return;
    
    setProcessingItems(prev => new Set(prev).add(productId));
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5521/favorites/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh wishlist data
        if (onWishlistUpdate) {
          onWishlistUpdate();
        }
      } else {
        alert(data.message || "Failed to remove item from wishlist");
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      alert(err.message || "Failed to remove item from wishlist");
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    if (cartLoading.has(productId)) return;
    
    setCartLoading(prev => new Set(prev).add(productId));
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5521/api/cart/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: productId,
          quantity: quantity
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Product added to cart successfully!");
      } else {
        alert(data.message || "Failed to add product to cart");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert(err.message || "Failed to add product to cart");
    } finally {
      setCartLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleAddAllToCart = async () => {
    if (wishlistData.length === 0) return;
    
    setCartLoading(new Set(wishlistData.map(item => item.productId || item.id)));
    
    try {
      let successCount = 0;
      const token = localStorage.getItem('authToken');
      
      for (const item of wishlistData) {
        try {
          const productId = item.productId || item.id;
          const response = await fetch('http://localhost:5521/api/cart/items', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              productId: productId,
              quantity: item.quantity || 1
            })
          });

          const data = await response.json();
          if (data.success) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to add product ${item.productId || item.id} to cart:`, err);
        }
      }
      
      if (successCount > 0) {
        alert(`Successfully added ${successCount} item(s) to cart!`);
      } else {
        alert("Failed to add any items to cart");
      }
    } catch (err) {
      console.error("Error adding all to cart:", err);
      alert("Failed to add items to cart");
    } finally {
      setCartLoading(new Set());
    }
  };

  const handleClearWishlist = async () => {
    if (!window.confirm("Are you sure you want to clear your entire wishlist?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      let successCount = 0;
      
      for (const item of wishlistData) {
        try {
          const productId = item.productId || item.id;
          const response = await fetch(`http://localhost:5521/favorites/${productId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          if (data.success) {
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to remove product ${item.productId || item.id}:`, err);
        }
      }
      
      if (successCount > 0) {
        alert(`Successfully removed ${successCount} item(s) from wishlist!`);
        if (onWishlistUpdate) {
          onWishlistUpdate();
        }
      } else {
        alert("Failed to clear wishlist");
      }
    } catch (err) {
      console.error("Error clearing wishlist:", err);
      alert("Failed to clear wishlist");
    }
  };

  // Enhanced image handling like AdminProducts
  const getBestImageUrl = (product) => {
    return product.imageUrl || 
           getProductImageUrl(product.image) || 
           getProductImageUrl(product.thumbnail) || 
           getProductImageUrl(product.imageUrl) ||
           `${import.meta.env.VITE_PUBLIC_URL || ''}/assets/images/default-product.jpg`;
  };

  const handleImageError = (e, product) => {
    console.error(`Failed to load image for product ${product.id}:`, e.target.src);
    
    const fallbackImages = [
      product.imageUrl,
      getProductImageUrl(product.image),
      getProductImageUrl(product.thumbnail),
      getProductImageUrl(product.imageUrl),
      '/assets/images/default-product.jpg'
    ].filter(Boolean);

    let currentIndex = fallbackImages.indexOf(e.target.src) + 1;
    
    if (currentIndex < fallbackImages.length) {
      e.target.src = fallbackImages[currentIndex];
    } else {
      e.target.src = `${import.meta.env.VITE_PUBLIC_URL || ''}/assets/images/default-product.jpg`;
      e.target.style.opacity = '0.5';
      e.target.onerror = null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`w-full ${className || ""}`}>
        <div className="w-full mb-6">
          <h2 className="text-[22px] font-bold text-qblack">My Wishlist</h2>
          <p className="text-qgray text-sm mt-1">Manage your favorite products</p>
        </div>
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-qblack"></div>
        </div>
        <p className="text-center text-qgray">Loading your wishlist...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`w-full ${className || ""}`}>
        <div className="w-full mb-6">
          <h2 className="text-[22px] font-bold text-qblack">My Wishlist</h2>
          <p className="text-qgray text-sm mt-1">Manage your favorite products</p>
        </div>
        <div className="text-center py-10">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button 
            onClick={onRefresh}
            className="yellow-btn px-6 py-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!wishlistData || wishlistData.length === 0) {
    return (
      <div className={`w-full ${className || ""}`}>
        <div className="w-full mb-6">
          <h2 className="text-[22px] font-bold text-qblack">My Wishlist</h2>
          <p className="text-qgray text-sm mt-1">Manage your favorite products</p>
        </div>
        <div className="text-center py-10">
          <div className="text-qgray text-lg mb-4">Your wishlist is empty</div>
          <p className="text-qgray mb-6">Start adding products you love to your wishlist!</p>
          <a href="/products" className="yellow-btn px-6 py-2">
            Browse Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full mb-6">
        <h2 className="text-[22px] font-bold text-qblack">My Wishlist</h2>
        <p className="text-qgray text-sm mt-1">Manage your favorite products</p>
      </div>
      
      <div className={`w-full ${className || ""}`}>
        <div className="relative w-full overflow-x-auto border border-[#EDEDED]">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <tbody>
              {/* Table Header */}
              <tr className="text-[13px] font-medium text-black bg-[#F6F6F6] whitespace-nowrap px-2 border-b default-border-bottom uppercase">
                <td className="py-4 pl-10 block whitespace-nowrap w-[380px]">Product</td>
                <td className="py-4 whitespace-nowrap text-center">Price</td>
                <td className="py-4 whitespace-nowrap text-center">Stock Status</td>
                <td className="py-4 whitespace-nowrap text-center">Actions</td>
              </tr>
              
              {/* Wishlist Items */}
              {wishlistData.map((item) => {
                const productId = item.productId || item.id;
                const product = item.product || item;
                const quantity = item.quantity || 1;
                const price = product.price || product.unitPrice || 0;
                const isProcessing = processingItems.has(productId);
                const isCartLoading = cartLoading.has(productId);
                const imageUrl = getBestImageUrl(product);
                
                return (
                  <tr key={productId} className="bg-white border-b hover:bg-gray-50">
                    <td className="pl-10 py-4 w-[380px]">
                      <div className="flex space-x-6 items-center">
                        <div className="w-[80px] h-[80px] overflow-hidden flex justify-center items-center border border-[#EDEDED]">
                          <img 
                            src={imageUrl}
                            alt={product.name || product.title}
                            className="w-full h-full object-contain"
                            onError={(e) => handleImageError(e, product)}
                          />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <h4 className="font-medium text-[15px] text-qblack mb-1">
                            {product.name || product.title || "Unknown Product"}
                          </h4>
                          <p className="text-sm text-qgray">
                            {product.category || product.categoryName || ""}
                          </p>
                          <p className="text-xs text-qgray mt-1">
                            ID: {productId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 px-2">
                      <div className="flex space-x-1 items-center justify-center">
                        <span className="text-[15px] font-normal">
                          ${parseFloat(price).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-2">
                      <span className={`text-[15px] font-normal ${
                        product.stockStatus === 'OUT_OF_STOCK' ? 'text-red-500' : 
                        product.stockStatus === 'LOW_STOCK' ? 'text-orange-500' : 'text-green-500'
                      }`}>
                        {product.stockStatus === 'IN_STOCK' ? 'In Stock' :
                         product.stockStatus === 'LOW_STOCK' ? 'Low Stock' :
                         product.stockStatus === 'OUT_OF_STOCK' ? 'Out of Stock' :
                         'Check Availability'}
                      </span>
                    </td>
                    <td className="text-right py-4">
                      <div className="flex space-x-3 items-center justify-center">
                        <button
                          onClick={() => handleAddToCart(productId, quantity)}
                          disabled={isCartLoading}
                          className={`px-4 py-2 rounded text-sm font-medium ${
                            isCartLoading 
                              ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {isCartLoading ? 'Adding...' : 'Add to Cart'}
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(productId)}
                          disabled={isProcessing}
                          className={`px-4 py-2 rounded text-sm font-medium ${
                            isProcessing 
                              ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          {isProcessing ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="w-full mt-[30px] flex sm:justify-end justify-start">
        <div className="sm:flex sm:space-x-[30px] items-center">
          <button 
            type="button" 
            onClick={handleClearWishlist}
            disabled={wishlistData.length === 0}
            className={`text-sm font-semibold mb-5 sm:mb-0 ${
              wishlistData.length === 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-qred hover:text-red-700'
            }`}
          >
            Clear Wishlist
          </button>
          <div className="w-[180px] h-[50px]">
            <button 
              type="button" 
              onClick={handleAddAllToCart}
              disabled={wishlistData.length === 0 || cartLoading.size > 0}
              className={`yellow-btn w-full h-full flex items-center justify-center ${
                wishlistData.length === 0 || cartLoading.size > 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-yellow-600'
              }`}
            >
              <span className="w-full text-sm font-semibold">
                {cartLoading.size > 0 ? 'Adding...' : 'Add All to Cart'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}