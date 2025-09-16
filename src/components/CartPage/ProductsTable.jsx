import { useState } from "react";
import InputQuantityCom from "../Helpers/InputQuantityCom";

export default function ProductsTable({ className, cartData, onCartUpdate }) {
  const [updating, setUpdating] = useState(false);

  // Use cartItems from backend response
  const cartItems = cartData?.cartItems || [];

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5521/api/cart/items/${productId}?newQuantity=${newQuantity}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        onCartUpdate(); // Refresh cart data
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (productId) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5521/api/cart/items/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        onCartUpdate(); // Refresh cart data
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className={`w-full ${className || ""}`}>
        <div className="text-center py-8">
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className || ""}`}>
      <div className="relative w-full overflow-x-auto border border-[#EDEDED]">
        <table className="w-full text-sm text-left text-gray-500">
          <tbody>
            {/* Table heading */}
            <tr className="text-[13px] font-medium text-black bg-[#F6F6F6] whitespace-nowrap border-b uppercase">
              <th className="py-4 pl-10 min-w-[300px]">Product</th>
              <th className="py-4 text-center">Price</th>
              <th className="py-4 text-center">Quantity</th>
              <th className="py-4 text-center">Total</th>
              <th className="py-4 text-right w-[114px]">Action</th>
            </tr>
            
            {/* Cart items */}
            {cartItems.map((item) => (
              <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                <td className="pl-10 py-4">
                  <div className="flex space-x-6 items-center">
                    <div className="w-[80px] h-[80px] overflow-hidden flex justify-center items-center border border-[#EDEDED]">
                      <img
                        src={item.productImage || `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-${item.productId || 1}.jpg`}
                        alt={item.productName || `Product ${item.productId}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <p className="font-medium text-[15px] text-qblack">
                        {item.productName || `Product #${item.productId}`}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.productDescription || "Item in your cart"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="text-center py-4 px-2">
                  <span className="text-[15px] font-normal">
                    ${item.price?.toFixed(2) || "0.00"}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex justify-center items-center">
                    <InputQuantityCom 
                      quantity={item.quantity}
                      onQuantityChange={(newQuantity) => updateQuantity(item.productId, newQuantity)}
                      disabled={updating}
                    />
                  </div>
                </td>
                <td className="text-center py-4">
                  <span className="text-[15px] font-normal">
                    ${((item.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </td>
                <td className="text-right py-4">
                  <button
                    onClick={() => removeItem(item.productId)}
                    disabled={updating}
                    className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.7 0.3C9.3 -0.1 8.7 -0.1 8.3 0.3L5 3.6L1.7 0.3C1.3 -0.1 0.7 -0.1 0.3 0.3C-0.1 0.7 -0.1 1.3 0.3 1.7L3.6 5L0.3 8.3C-0.1 8.7 -0.1 9.3 0.3 9.7C0.7 10.1 1.3 10.1 1.7 9.7L5 6.4L8.3 9.7C8.7 10.1 9.3 10.1 9.7 9.7C10.1 9.3 10.1 8.7 9.7 8.3L6.4 5L9.7 1.7C10.1 1.3 10.1 0.7 9.7 0.3Z"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}