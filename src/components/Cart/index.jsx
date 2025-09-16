import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Cart({ className, type }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
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
        if (data.success && data.cart) {
          setCartItems(data.cart.cartItems || []);
          setSubtotal(data.cart.totalAmount || 0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5521/api/cart/items/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchCartData();
      }
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  if (loading) {
    return (
      <div className={`w-[300px] bg-white border-t-[3px] ${type === 3 ? "border-qh3-blue" : "border-qyellow"} ${className || ""}`}>
        <div className="flex justify-center items-center h-40">
          <span>Loading cart...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ boxShadow: "0px 15px 50px 0px rgba(0, 0, 0, 0.14)" }}
      className={`w-[300px] bg-white border-t-[3px] ${
        type === 3 ? "border-qh3-blue" : "border-qyellow"
      } ${className || ""}`}
    >
      <div className="w-full h-full">
        <div className="product-items h-[310px] overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <ul>
              {cartItems.map((item) => (
                <li key={item.id} className="w-full flex relative border-b border-gray-100">
                  <div className="flex space-x-3 justify-center items-center px-4 py-4 w-full">
                    <div className="w-[65px] h-[65px]">
                      <img
                        src={item.productImage || `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-${item.productId || 1}.jpg`}
                        alt={item.productName || `Product ${item.productId}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <p className="title mb-1 text-[13px] font-semibold text-qblack leading-4 line-clamp-2 hover:text-blue-600">
                        {item.productName || `Product #${item.productId}`}
                      </p>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                        {item.productDescription || "Item in your cart"}
                      </p>
                      <p className="price flex items-center">
                        <span className="text-qred font-semibold text-[15px]">
                          ${item.price?.toFixed(2)}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          x {item.quantity}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="absolute top-4 right-3 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 8 8"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M7.76 0.24C7.44 -0.08 6.96 -0.08 6.64 0.24L4 2.88L1.36 0.24C1.04 -0.08 0.56 -0.08 0.24 0.24C-0.08 0.56 -0.08 1.04 0.24 1.36L2.88 4L0.24 6.64C-0.08 6.96 -0.08 7.44 0.24 7.76C0.56 8.08 1.04 8.08 1.36 7.76L4 5.12L6.64 7.76C6.96 8.08 7.44 8.08 7.76 7.76C8.08 7.44 8.08 6.96 7.76 6.64L5.12 4L7.76 1.36C8.08 1.04 8.08 0.56 7.76 0.24Z" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <>
            <div className="w-full px-4 mt-4 mb-3">
              <div className="h-[1px] bg-[#F0F1F3]"></div>
            </div>
            <div className="product-actions px-4 mb-6">
              <div className="total-equation flex justify-between items-center mb-4">
                <span className="text-[15px] font-medium text-qblack">Subtotal</span>
                <span className="text-[15px] font-medium text-qred">${subtotal.toFixed(2)}</span>
              </div>
              <div className="product-action-btn space-y-2">
                <Link to="/cart">
                  <div className="gray-btn w-full h-[50px] flex items-center justify-center">
                    <span className="text-sm font-semibold">View Cart</span>
                  </div>
                </Link>
                <Link to="/checkout">
                  <div className={`w-full h-[50px] ${type === 3 ? "blue-btn" : "yellow-btn"} flex items-center justify-center`}>
                    <span className="text-sm font-semibold">Checkout Now</span>
                  </div>
                </Link>
              </div>
            </div>
            <div className="w-full px-4">
              <div className="h-[1px] bg-[#F0F1F3]"></div>
            </div>
          </>
        )}
        
        <div className="flex justify-center py-4">
          <p className="text-[13px] font-medium text-gray-500">
            Get Return within <span className="text-qblack">30 days</span>
          </p>
        </div>
      </div>
    </div>
  );
}