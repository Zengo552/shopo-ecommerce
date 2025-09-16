import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BreadcrumbCom from "../BreadcrumbCom";
import EmptyCardError from "../EmptyCardError";
import InputCom from "../Helpers/InputCom";
import PageTitle from "../Helpers/PageTitle";
import Layout from "../Partials/Layout";
import ProductsTable from "./ProductsTable";

export default function CartPage({ cart = true }) {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discountCode, setDiscountCode] = useState("");
  const [postcode, setPostcode] = useState(""); // Added for postcode input

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5521/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Cart API Response:", data);
        
        if (data.success) {
          setCartData(data.cart); // Use the original response structure
        } else {
          setError(data.message || "Failed to load cart");
        }
      } else if (response.status === 401) {
        setError("Your session has expired. Please log in again.");
        localStorage.removeItem('authToken');
        window.dispatchEvent(new Event('authChange'));
      } else {
        setError("Failed to load cart. Please try again.");
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const applyDiscount = () => {
    console.log("Applying discount code:", discountCode);
  };

  const updateCart = () => {
    fetchCart();
  };

  if (loading) {
    return (
      <Layout>
        <div className="cart-page-wrapper w-full">
          <div className="container-x mx-auto">
            <BreadcrumbCom
              paths={[
                { name: "home", path: "/" },
                { name: "cart", path: "/cart" },
              ]}
            />
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading your cart...</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="cart-page-wrapper w-full">
          <div className="container-x mx-auto">
            <BreadcrumbCom
              paths={[
                { name: "home", path: "/" },
                { name: "cart", path: "/cart" },
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

  const isEmpty = !cartData || !cartData.cartItems || cartData.cartItems.length === 0;

  if (isEmpty) {
    return (
      <Layout childrenClasses={cart ? "pt-0 pb-0" : ""}>
        <div className="cart-page-wrapper w-full">
          <div className="container-x mx-auto">
            <BreadcrumbCom
              paths={[
                { name: "home", path: "/" },
                { name: "cart", path: "/cart" },
              ]}
            />
            <EmptyCardError />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout childrenClasses={cart ? "pt-0 pb-0" : ""}>
      <div className="cart-page-wrapper w-full bg-white pb-[60px]">
        <div className="w-full">
          <PageTitle
            title="Your Cart"
            breadcrumb={[
              { name: "home", path: "/" },
              { name: "cart", path: "/cart" },
            ]}
          />
        </div>
        <div className="w-full mt-[23px]">
          <div className="container-x mx-auto">
            <ProductsTable 
              className="mb-[30px]" 
              cartData={cartData}
              onCartUpdate={fetchCart}
            />
            <div className="w-full sm:flex justify-between">
              <div className="discount-code sm:w-[270px] w-full mb-5 sm:mb-0 h-[50px] flex">
                <div className="flex-1 h-full">
                  <InputCom 
                    type="text" 
                    placeholder="Discount Code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                </div>
                <button 
                  type="button" 
                  className="w-[90px] h-[50px] black-btn"
                  onClick={applyDiscount}
                >
                  <span className="text-sm font-semibold">Apply</span>
                </button>
              </div>
              <div className="flex space-x-2.5 items-center">
                <Link to="/products">
                  <div className="w-[220px] h-[50px] bg-[#F6F6F6] flex justify-center items-center">
                    <span className="text-sm font-semibold">
                      Continue Shopping
                    </span>
                  </div>
                </Link>
                <button onClick={updateCart}>
                  <div className="w-[140px] h-[50px] bg-[#F6F6F6] flex justify-center items-center">
                    <span className="text-sm font-semibold">Update Cart</span>
                  </div>
                </button>
              </div>
            </div>
            <div className="w-full mt-[30px] flex sm:justify-end">
              <div className="sm:w-[370px] w-full border border-[#EDEDED] px-[30px] py-[26px]">
                <div className="sub-total mb-6">
                  <div className="flex justify-between mb-6">
                    <p className="text-[15px] font-medium text-qblack">
                      Subtotal
                    </p>
                    <p className="text-[15px] font-medium text-qred">
                      ${cartData.totalAmount?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="w-full h-[1px] bg-[#EDEDED]"></div>
                </div>
                
                <div className="shipping mb-6">
                  <span className="text-[15px] font-medium text-qblack mb-[18px] block">
                    Shipping
                  </span>
                  <ul className="flex flex-col space-y-1">
                    <li>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2.5 items-center">
                          <input
                            type="radio"
                            name="shipping"
                            value="free"
                            defaultChecked
                            className="accent-pink-500"
                          />
                          <span className="text-[13px] text-normal text-qgraytwo">
                            Free Shipping
                          </span>
                        </div>
                        <span className="text-[13px] text-normal text-qgraytwo">
                          +$0.00
                        </span>
                      </div>
                    </li>
                    <li>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2.5 items-center">
                          <input
                            type="radio"
                            name="shipping"
                            value="flat"
                            className="accent-pink-500"
                          />
                          <span className="text-[13px] text-normal text-qgraytwo">
                            Flat Rate
                          </span>
                        </div>
                        <span className="text-[13px] text-normal text-qgraytwo">
                          +$10.00
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Fixed the postcode input field */}
                <div className="shipping-calculation w-full mb-3">
                  <div className="title mb-[17px]">
                    <h1 className="text-[15px] font-medium">
                      Calculate Shipping
                    </h1>
                  </div>
                  <div className="w-full h-[50px] border border-[#EDEDED] px-5 flex justify-between items-center mb-2">
                    <span className="text-[13px] text-qgraytwo">
                      Select Country
                    </span>
                    <span>
                      <svg
                        width="11"
                        height="7"
                        viewBox="0 0 11 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5.4 6.8L0 1.4L1.4 0L5.4 4L9.4 0L10.8 1.4L5.4 6.8Z"
                          fill="#222222"
                        />
                      </svg>
                    </span>
                  </div>
                  <div className="w-full h-[50px]">
                    <InputCom
                      inputClasses="w-full h-full"
                      type="text"
                      placeholder="Postcode / ZIP"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                    />
                  </div>
                </div>

                <button type="button" className="w-full mb-10">
                  <div className="w-full h-[50px] bg-[#F6F6F6] flex justify-center items-center">
                    <span className="text-sm font-semibold">Update Cart</span>
                  </div>
                </button>

                <div className="total mb-6">
                  <div className="flex justify-between">
                    <p className="text-[18px] font-medium text-qblack">
                      Total
                    </p>
                    <p className="text-[18px] font-medium text-qred">
                      ${cartData.totalAmount?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
                <Link to="/checkout">
                  <div className="w-full h-[50px] black-btn flex justify-center items-center">
                    <span className="text-sm font-semibold">
                      Proceed to Checkout
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}