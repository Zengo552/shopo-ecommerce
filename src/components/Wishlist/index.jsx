import { useState, useEffect } from "react";
import axios from 'axios';
import BreadcrumbCom from "../BreadcrumbCom";
import EmptyWishlistError from "../EmptyWishlistError";
import PageTitle from "../Helpers/PageTitle";
import Layout from "../Partials/Layout";
import ProductsTable from "./ProductsTable";

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

      const response = await axios.get('http://localhost:8080/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setFavoriteProducts(response.data.favorites || []);
      } else {
        setError(response.data.message || "Failed to load wishlist");
      }
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
      if (err.response && err.response.status === 401) {
        setError("Your session has expired. Please log in again.");
        // Clear invalid token
        localStorage.removeItem('authToken');
        window.dispatchEvent(new Event('authChange'));
      } else if (err.response && err.response.status === 404) {
        setError("Wishlist endpoint not found. Please check the API URL.");
      } else {
        setError("Failed to load your wishlist. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to remove a product from favorites
  const removeFromFavorites = async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.delete(`http://localhost:8080/favorites/${productId}`, {
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
      
      // This would require a new endpoint in your Spring Boot controller
      // For now, we'll remove items one by one
      const deletePromises = favoriteProducts.map(product => 
        axios.delete(`http://localhost:8080/favorites/${product.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      );
      
      await Promise.all(deletePromises);
      setFavoriteProducts([]);
    } catch (err) {
      console.error("Clear wishlist failed:", err);
      alert('Failed to clear wishlist. Please try again.');
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (wishlist) {
      fetchFavorites();
    }
  }, [wishlist]);

  // Show loading state
  if (loading && wishlist) {
    return (
      <Layout>
        <div className="wishlist-page-wrapper w-full">
          <div className="container-x mx-auto">
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
            <div className="flex justify-center items-center h-64">
              <div className="text-red-500 text-lg">{error}</div>
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
                  >
                    <div className="w-full text-sm font-semibold text-qred mb-5 sm:mb-0">
                      Clean Wishlist
                    </div>
                  </button>
                  <div className="w-[180px] h-[50px]">
                    <button type="button" className="yellow-btn">
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