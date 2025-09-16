import { useState, useEffect } from "react";
import Cart from "../../../Cart";
import Compair from "../../../Helpers/icons/Compair";
import ThinBag from "../../../Helpers/icons/ThinBag";
import ThinLove from "../../../Helpers/icons/ThinLove";
import ThinPeople from "../../../Helpers/icons/ThinPeople";
import SearchBox from "../../../Helpers/SearchBox";
import { Link } from "react-router-dom";

export default function Middlebar({ className, type }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Check if user is logged in on component mount and on auth changes
  useEffect(() => {
    checkAuthStatus();
    
    // Listen for auth changes from other components
    window.addEventListener('authChange', checkAuthStatus);
    
    return () => {
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);

  // Function to check authentication status
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('userData');
      
      if (token) {
        // Verify the token is valid (not expired)
        if (isTokenExpired(token)) {
          console.log("Token expired, logging out");
          handleLogout();
          return;
        }
        
        setIsLoggedIn(true);
        setUserData(user ? JSON.parse(user) : null);
        
        // Fetch cart and wishlist counts if logged in
        fetchCartCount(token);
        fetchWishlistCount(token);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
        setCartCount(0);
        setWishlistCount(0);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsLoggedIn(false);
    }
  };

  // Check if JWT token is expired
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  };

  // Fetch cart count from backend with authentication
  const fetchCartCount = async (token) => {
    try {
      // Update this endpoint to match your actual cart count API
      const response = await fetch('http://localhost:5521/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.count || 0);
      } else if (response.status === 404) {
        // Endpoint doesn't exist, set default count
        setCartCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
      setCartCount(0);
    }
  };

  // Fetch wishlist count from backend with authentication
  const fetchWishlistCount = async (token) => {
    try {
      // Update this endpoint to match your actual favorites count API
      const response = await fetch('http://localhost:5521/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWishlistCount(data.count || 0);
      } else if (response.status === 404) {
        // Endpoint doesn't exist, set default count
        setWishlistCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist count:", error);
      setWishlistCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUserData(null);
    setCartCount(0);
    setWishlistCount(0);
    
    // Notify other components about auth change
    window.dispatchEvent(new Event('authChange'));
    
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <div className={`w-full h-[86px] bg-white ${className}`}>
      <div className="container-x mx-auto h-full">
        <div className="relative h-full">
          <div className="flex justify-between items-center h-full">
            <div>
              {/* Logo code remains the same */}
            </div>
            <div className="w-[517px] h-[44px]">
              <SearchBox type={type} className="search-com" />
            </div>
            <div className="flex space-x-6 items-center">
              <div className="compaire relative">
                <Link to="/products-compaire">
                  <span>
                    <Compair />
                  </span>
                </Link>
                <span
                  className={`w-[18px] h-[18px] rounded-full absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] ${
                    type === 3 ? "bg-qh3-blue text-white" : "bg-qyellow"
                  }`}
                >
                  2
                </span>
              </div>
              
              {/* Wishlist icon with authentication check */}
              {isLoggedIn ? (
                <div className="favorite relative">
                  <Link to="/wishlist">
                    <span>
                      <ThinLove />
                    </span>
                  </Link>
                  <span
                    className={`w-[18px] h-[18px] rounded-full absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] ${
                      type === 3 ? "bg-qh3-blue text-white" : "bg-qyellow"
                    }`}
                  >
                    {wishlistCount}
                  </span>
                </div>
              ) : (
                <div className="favorite relative opacity-50 cursor-not-allowed" title="Login to access wishlist">
                  <span>
                    <ThinLove />
                  </span>
                </div>
              )}
              
              {/* Cart icon with authentication check */}
              {isLoggedIn ? (
                <div className="cart-wrapper group relative py-4">
                  <div className="cart relative cursor-pointer">
                    <Link to="/cart">
                      <span>
                        <ThinBag />
                      </span>
                    </Link>
                    <span
                      className={`w-[18px] h-[18px] rounded-full absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] ${
                        type === 3 ? "bg-qh3-blue text-white" : "bg-qyellow"
                      }`}
                    >
                      {cartCount}
                    </span>
                  </div>
                  <Cart
                    type={type}
                    className="absolute -right-[45px] top-11 z-50 hidden group-hover:block"
                  />
                </div>
              ) : (
                <div className="cart-wrapper group relative py-4 opacity-50 cursor-not-allowed" title="Login to access cart">
                  <div className="cart relative">
                    <span>
                      <ThinBag />
                    </span>
                  </div>
                </div>
              )}
              
              <div>
                <Link to={isLoggedIn ? "/profile" : "/login"}>
                  <span>
                    <ThinPeople />
                  </span>
                </Link>
              </div>
              
              {/* Show login status */}
              <div className="text-sm">
                {isLoggedIn ? (
                  <div className="flex items-center">
                    <span className="mr-2">Hi, {userData?.firstName || 'User'}</span>
                    <button 
                      onClick={handleLogout}
                      className="text-xs text-qred hover:underline"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Link to="/login" className="text-xs hover:underline">Login</Link>
                    <span className="text-xs">/</span>
                    <Link to="/register" className="text-xs hover:underline">Register</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}