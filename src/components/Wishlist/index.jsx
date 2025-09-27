// src/pages/wishlist/index.jsx
import { useState, useEffect } from "react";
import axios from 'axios';
import BreadcrumbCom from "../BreadcrumbCom";
import EmptyWishlistError from "../EmptyWishlistError";
import PageTitle from "../Helpers/PageTitle";
import Layout from "../Partials/Layout";
import ProductsTable from "./ProductsTable";
import { getProductImageUrl } from "../Helpers/imageUtils";

const api = axios.create({
  baseURL: 'http://localhost:5521',
  timeout: 10000,
});

export default function Wishlist({ wishlist = true }) {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      console.log("Fetching favorites from backend...");
      
      const response = await api.get('/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("Full backend response:", response.data);

      if (response.data.success) {
        // Map the backend response with proper image handling
        const mappedProducts = (response.data.favorites || []).map((favorite) => {
          // Get the image filename from any available field
          const imageFilename = favorite.imageUrl || favorite.productImage || 
                              favorite.image || favorite.thumbnail;
          
          // Convert to full URL using the same pattern as cart
          const productImage = imageFilename ? getProductImageUrl(imageFilename) : null;

          return {
            id: favorite.productId,
            name: favorite.productName,
            price: favorite.price,
            productImage: productImage,
            description: favorite.description || "",
            color: favorite.color || null,
            size: favorite.size || "Standard"
          };
        });
        
        console.log("Mapped products with full image URLs:", mappedProducts);
        setFavoriteProducts(mappedProducts);
      } else {
        setError(response.data.message || "Failed to load wishlist");
      }
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        localStorage.removeItem('authToken');
        window.dispatchEvent(new Event('authChange'));
      } else {
        setError("Failed to load wishlist. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        alert("Please log in to remove items");
        return;
      }

      const response = await api.delete(`/favorites/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setFavoriteProducts(prevProducts => 
          prevProducts.filter(product => product.id !== productId)
        );
      } else {
        alert('Failed to remove item: ' + response.data.message);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      if (err.response && err.response.status === 401) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem('authToken');
        window.dispatchEvent(new Event('authChange'));
      } else {
        alert('Failed to remove item. Please try again.');
      }
    }
  };

  const clearWishlist = async () => {
    if (!window.confirm("Are you sure you want to clear your entire wishlist?")) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        alert("Please log in to clear wishlist");
        return;
      }

      const deletePromises = favoriteProducts.map(product => 
        api.delete(`/favorites/${product.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      );
      
      await Promise.all(deletePromises);
      setFavoriteProducts([]);
      alert("Wishlist cleared successfully!");
    } catch (err) {
      console.error("Clear wishlist failed:", err);
      alert('Failed to clear wishlist. Please try again.');
    }
  };

  const addAllToCart = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        alert("Please log in to add items to cart");
        return;
      }

      if (favoriteProducts.length === 0) {
        alert("Your wishlist is empty!");
        return;
      }

      const addToCartPromises = favoriteProducts.map(product => 
        api.post('/api/cart/items', {
          productId: product.id,
          quantity: 1
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );

      const results = await Promise.allSettled(addToCartPromises);
      
      const successfulAdds = results.filter(result => 
        result.status === 'fulfilled' && result.value.data.success
      );
      const failedAdds = results.filter(result => 
        result.status === 'rejected' || !result.value?.data?.success
      );

      if (successfulAdds.length > 0) {
        alert(`Successfully added ${successfulAdds.length} items to cart!`);
      }
      
      if (failedAdds.length > 0) {
        alert(`Failed to add ${failedAdds.length} items to cart. They might be out of stock.`);
      }
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert('Failed to add items to cart. Please try again.');
    }
  };

  useEffect(() => {
    if (wishlist) {
      fetchFavorites();
    }
  }, [wishlist]);

  const handleRetry = () => {
    fetchFavorites();
  };

  if (loading && wishlist) {
    return (
      <Layout>
        <div className="wishlist-page-wrapper w-full">
          <div className="container-x mx-auto">
            <BreadcrumbCom
              paths={[
                { name: "home", path: "/" },
                { name: "wishlist", path: "/wishlist" },
              ]}
            />
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading your wishlist...</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && wishlist) {
    return (
      <Layout>
        <div className="wishlist-page-wrapper w-full">
          <div className="container-x mx-auto">
            <BreadcrumbCom
              paths={[
                { name: "home", path: "/" },
                { name: "wishlist", path: "/wishlist" },
              ]}
            />
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
              <div className="text-red-500 text-lg text-center">{error}</div>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
              <div className="text-sm text-gray-500">
                Make sure the backend server is running on port 5521
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout childrenClasses={wishlist ? "pt-0 pb-0" : ""}>
      {wishlist === false || favoriteProducts.length === 0 ? (
        <div className="wishlist-page-wrapper w-full">
          <div className="container-x mx-auto">
            <BreadcrumbCom
              paths={[
                { name: "home", path: "/" },
                { name: "wishlist", path: "/wishlist" },
              ]}
            />
            <EmptyWishlistError />
          </div>
        </div>
      ) : (
        <div className="wishlist-page-wrapper w-full bg-white pb-[60px]">
          <div className="w-full">
            <PageTitle
              title="Wishlist"
              breadcrumb={[
                { name: "home", path: "/" },
                { name: "wishlist", path: "/wishlist" },
              ]}
            />
          </div>
          <div className="w-full mt-[23px]">
            <div className="container-x mx-auto">
              <ProductsTable 
                className="mb-[30px]" 
                products={favoriteProducts} 
                onRemoveItem={removeFromFavorites}
              />
              <div className="w-full mt-[30px] flex sm:justify-end justify-start">
                <div className="sm:flex sm:space-x-[30px] items-center">
                  <button 
                    type="button"
                    onClick={clearWishlist}
                    className="text-sm font-semibold text-qred mb-5 sm:mb-0 hover:text-red-700 transition-colors"
                  >
                    Clean Wishlist
                  </button>
                  <div className="w-[180px] h-[50px]">
                    <button 
                      type="button" 
                      className="yellow-btn w-full h-full"
                      onClick={addAllToCart}
                    >
                      <div className="w-full text-sm font-semibold">
                        Add to Cart All
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}