import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { favoriteAPI, reviewAPI } from "../../../services/api";
import BreadcrumbCom from "../../BreadcrumbCom";
import Layout from "../../Partials/Layout";
import IcoAdress from "./icons/IcoAdress";
import IcoCart from "./icons/IcoCart";
import IcoDashboard from "./icons/IcoDashboard";
import IcoLogout from "./icons/IcoLogout";
import IcoLove from "./icons/IcoLove";
import IcoPassword from "./icons/IcoPassword";
import IcoPayment from "./icons/IcoPayment";
import IcoPeople from "./icons/IcoPeople";
import IcoReviewHand from "./icons/IcoReviewHand";
import IcoSupport from "./icons/IcoSupport";
import AddressesTab from "./tabs/AddressesTab";
import Dashboard from "./tabs/Dashboard";
import OrderTab from "./tabs/OrderTab";
import PasswordTab from "./tabs/PasswordTab";
import Payment from "./tabs/Payment";
import ProfileTab from "./tabs/ProfileTab";
import ReviewTab from "./tabs/ReviewTab";
import SupportTab from "./tabs/SupportTab";
import WishlistTab from "./tabs/WishlistTab";

export default function Profile() {
  const [switchDashboard, setSwitchDashboard] = useState(false);
  const [wishlistData, setWishlistData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);
  const [loading, setLoading] = useState({
    wishlist: false,
    reviews: false
  });
  const [error, setError] = useState({
    wishlist: null,
    reviews: null
  });

  const location = useLocation();
  const getHashContent = location.hash.split("#");
  const [active, setActive] = useState("dashboard");

  useEffect(() => {
    setActive(
      getHashContent && getHashContent.length > 1
        ? getHashContent[1]
        : "dashboard"
    );
  }, [getHashContent]);

  // Fetch wishlist data when wishlist tab is active
  useEffect(() => {
    if (active === "wishlist") {
      fetchWishlistData();
    }
  }, [active]);

  // Fetch reviews data when reviews tab is active
  useEffect(() => {
    if (active === "review") {
      fetchReviewsData();
    }
  }, [active]);

  const fetchWishlistData = async () => {
    setLoading(prev => ({ ...prev, wishlist: true }));
    setError(prev => ({ ...prev, wishlist: null }));
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError(prev => ({ ...prev, wishlist: "Please log in to view wishlist" }));
        setLoading(prev => ({ ...prev, wishlist: false }));
        return;
      }

      // Use the same API endpoint as the main wishlist page
      const response = await fetch('http://localhost:5521/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log("Raw wishlist API response:", data);
      
      if (data.success) {
        // Transform the data to match what WishlistTab expects
        const transformedData = (data.favorites || data.data || []).map(favorite => {
          const product = favorite.product || favorite;
          return {
            id: favorite.productId || favorite.id,
            productId: favorite.productId || favorite.id,
            product: {
              id: favorite.productId || favorite.id,
              name: product.name || product.productName || product.title,
              title: product.name || product.productName || product.title,
              price: product.price || product.unitPrice || favorite.price || 0,
              image: product.image || product.imageUrl || product.thumbnail,
              imageUrl: product.image || product.imageUrl || product.thumbnail,
              thumbnail: product.thumbnail || product.image || product.imageUrl,
              stockStatus: product.stockStatus || 'IN_STOCK',
              stockQuantity: product.stockQuantity || product.stock || 10,
              category: product.category?.name || product.categoryName || product.category || ""
            },
            quantity: favorite.quantity || 1,
            createdAt: favorite.createdAt
          };
        });
        
        console.log("Transformed wishlist data:", transformedData);
        setWishlistData(transformedData);
      } else {
        setError(prev => ({ ...prev, wishlist: data.message || "Failed to load wishlist" }));
        setWishlistData([]);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError(prev => ({ 
        ...prev, 
        wishlist: err.message || "Failed to load wishlist. Please try again." 
      }));
      setWishlistData([]);
    } finally {
      setLoading(prev => ({ ...prev, wishlist: false }));
    }
  };

  const fetchReviewsData = async () => {
    setLoading(prev => ({ ...prev, reviews: true }));
    setError(prev => ({ ...prev, reviews: null }));
    
    try {
      // Get user ID from localStorage or context
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.id;
      
      if (userId) {
        const response = await reviewAPI.getByUser(userId);
        if (response.success) {
          setReviewsData(response.data || []);
        } else {
          setError(prev => ({ ...prev, reviews: response.message || "Failed to load reviews" }));
        }
      } else {
        setError(prev => ({ ...prev, reviews: "User not authenticated" }));
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(prev => ({ ...prev, reviews: err.message || "Failed to load reviews" }));
    } finally {
      setLoading(prev => ({ ...prev, reviews: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/login';
  };

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="profile-page-wrapper w-full">
        <div className="container-x mx-auto">
          <div className="w-full my-10">
            <BreadcrumbCom
              paths={[
                { name: "home", path: "/" },
                { name: "profile", path: "/profile" },
              ]}
            />
            <div className="w-full bg-white px-10 py-9">
              <div className="title-area w-full flex justify-between items-center">
                <h1 className="text-[22px] font-bold text-qblack">
                  Your Dashboard
                </h1>
                <div className="switch-dashboard flex space-x-3 items-center">
                  <p className="text-qgray text-base">Switch Dashboard</p>
                  <button
                    onClick={() => setSwitchDashboard(!switchDashboard)}
                    type="button"
                    className="w-[73px] h-[31px] border border-[#D9D9D9] rounded-full relative "
                  >
                    <div
                      className={`w-[23px] h-[23px] bg-qblack rounded-full absolute top-[3px] transition-all duration-300 ease-in-out ${
                        switchDashboard ? "left-[44px]" : "left-[4px]"
                      }`}
                    ></div>
                  </button>
                </div>
              </div>
              <div className="profile-wrapper w-full mt-8 flex space-x-10">
                <div className="w-[236px] min-h-[600px] border-r border-[rgba(0, 0, 0, 0.1)]">
                  <div className="flex flex-col space-y-10">
                    <div className="item group">
                      <Link to="/profile#dashboard">
                        <div className="flex space-x-3 items-center text-qgray hover:text-qblack">
                          <span>
                            <IcoDashboard />
                          </span>
                          <span className=" font-normal text-base">
                            Dashboard
                          </span>
                        </div>
                      </Link>
                    </div>
                    <div className="item group">
                      <Link to="/profile#profile">
                        <div className="flex space-x-3 items-center text-qgray hover:text-qblack">
                          <span>
                            <IcoPeople />
                          </span>
                          <span className=" font-normal text-base">
                            Personal Info
                          </span>
                        </div>
                      </Link>
                    </div>

                    <div className="item group">
                      <Link to="/profile#payment">
                        <div className="flex space-x-3 items-center text-qgray hover:text-qblack">
                          <span>
                            <IcoPayment />
                          </span>
                          <span className=" font-normal text-base">
                            Payment Method
                          </span>
                        </div>
                      </Link>
                    </div>
                    <div className="item group">
                      <Link to="/profile#order">
                        <div className="flex space-x-3 items-center text-qgray hover:text-qblack">
                          <span>
                            <IcoCart />
                          </span>
                          <span className=" font-normal text-base">Order</span>
                        </div>
                      </Link>
                    </div>
                    <div className="item group">
                      <Link to="/profile#wishlist">
                        <div className="flex space-x-3 items-center text-qgray hover:text-qblack">
                          <span>
                            <IcoLove />
                          </span>
                          <span className=" font-normal text-base">
                            Wishlist
                          </span>
                        </div>
                      </Link>
                    </div>
                    <div className="item group">
                      <Link to="/profile#address">
                        <div className="flex space-x-3 items-center text-qgray hover:text-qblack">
                          <span>
                            <IcoAdress />
                          </span>
                          <span className=" font-normal text-base">
                            Address
                          </span>
                        </div>
                      </Link>
                    </div>
                    <div className="item group">
                      <Link to="/profile#review">
                        <div className="flex space-x-3 items-center text-qgray hover:text-qblack">
                          <span>
                            <IcoReviewHand />
                          </span>
                          <span className=" font-normal text-base">
                            Reviews
                          </span>
                        </div>
                      </Link>
                    </div>
                    <div className="item group">
                      <Link to="/profile#password">
                        <div className="flex space-x-3 items-center text-qgray hover:text-qblack">
                          <span>
                            <IcoPassword />
                          </span>
                          <span className=" font-normal text-base">
                            Change Password
                          </span>
                        </div>
                      </Link>
                    </div>
                    <div className="item group">
                      <Link to="/profile#support">
                        <div className="flex space-x-3 items-center text-qgray hover:text-qblack">
                          <span>
                            <IcoSupport />
                          </span>
                          <span className=" font-normal text-base">
                            Support Ticket
                          </span>
                        </div>
                      </Link>
                    </div>
                    <div className="item group">
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left"
                      >
                        <div className="flex space-x-3 items-center text-qgray hover:text-qblack">
                          <span>
                            <IcoLogout />
                          </span>
                          <span className=" font-normal text-base">
                            Log out
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="item-body dashboard-wrapper w-full">
                    {active === "dashboard" ? (
                      <Dashboard />
                    ) : active === "profile" ? (
                      <>
                        <ProfileTab />
                      </>
                    ) : active === "payment" ? (
                      <>
                        <Payment />
                      </>
                    ) : active === "order" ? (
                      <>
                        <OrderTab />
                      </>
                    ) : active === "wishlist" ? (
                      <>
                        <WishlistTab 
                          wishlistData={wishlistData}
                          loading={loading.wishlist}
                          error={error.wishlist}
                          onRefresh={fetchWishlistData}
                          onWishlistUpdate={fetchWishlistData}
                        />
                      </>
                    ) : active === "address" ? (
                      <>
                        <AddressesTab />
                      </>
                    ) : active === "password" ? (
                      <>
                        <PasswordTab />
                      </>
                    ) : active === "support" ? (
                      <>
                        <SupportTab />
                      </>
                    ) : active === "review" ? (
                      <>
                        <ReviewTab 
                          reviewsData={reviewsData}
                          loading={loading.reviews}
                          error={error.reviews}
                          onRefresh={fetchReviewsData}
                        />
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}