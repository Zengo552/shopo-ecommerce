import { useState, useEffect } from "react";
import axios from 'axios';
import BreadcrumbCom from "../BreadcrumbCom";
import EmptyWishlistError from "../EmptyWishlistError";
import PageTitle from "../Helpers/PageTitle";
import Layout from "../Partials/Layout";
import ProductsTable from "./ProductsTable";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5521',
  timeout: 10000, // 10 second timeout
});

export default function Wishlist({ wishlist = true }) {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch user's favorites from Spring Boot
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

      console.log("Backend response:", response.data);

      if (response.data.success) {
        // Map the backend response to match frontend expectations
        const mappedProducts = (response.data.favorites || []).map(favorite => ({
          id: favorite.productId,        // Map productId to id
          name: favorite.productName,    // Map productName to name
          price: favorite.price,
          imageUrl: favorite.imageUrl,
          // Add default values for missing fields
          description: favorite.description || "", // Use description if available
          color: favorite.color || null,           // Use color if available
          size: favorite.size || "Standard"        // Use size if available
        }));
        console.log("Mapped products:", mappedProducts);
        setFavoriteProducts(mappedProducts);
      } else {
        const errorMsg = response.data.message || "Failed to load wishlist";
        console.error("Backend returned error:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
      
      // Enhanced error logging
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        console.error("Response headers:", err.response.headers);
        
        switch (err.response.status) {
          case 401:
            setError("Your session has expired. Please log in again.");
            localStorage.removeItem('authToken');
            window.dispatchEvent(new Event('authChange'));
            break;
          case 500:
            setError("Server error. Please check the backend logs for details.");
            break;
          case 404:
            setError("Wishlist service not found. Please check if the backend is running.");
            break;
          case 403:
            setError("Access forbidden. You don't have permission to view favorites.");
            break;
          default:
            setError(`Failed to load your wishlist (Status: ${err.response.status}). Please try again later.`);
        }
      } else if (err.request) {
        console.error("No response received:", err.request);
        setError("Network error. Please check if the backend server is running on port 5521.");
      } else {
        console.error("Request setup error:", err.message);
        setError("An unexpected error occurred while setting up the request.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to remove a product from favorites
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
        // Remove the product from local state to update UI immediately
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

  // Function to clear the entire wishlist
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

      // Remove items one by one
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

  // Function to add all wishlist items to cart
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

      // Add each product to cart
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

  // Fetch data when component mounts
  useEffect(() => {
    if (wishlist) {
      fetchFavorites();
    }
  }, [wishlist]);

  // Retry function for users to try again
  const handleRetry = () => {
    fetchFavorites();
  };

  // Show loading state
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

  // Show error state
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