// src/pages/wishlist/ProductsTable.jsx
import { useState, useEffect } from "react";
import InputQuantityCom from "../Helpers/InputQuantityCom";

export default function ProductsTable({ className, products = [], onRemoveItem }) {
  const [quantities, setQuantities] = useState({});
  
  useEffect(() => {
    if (products && products.length > 0) {
      const initialQuantities = {};
      products.forEach(product => {
        initialQuantities[product.id] = product.quantity || 1;
      });
      setQuantities(initialQuantities);
    }
  }, [products]);

  // Enhanced image handling with better fallbacks
  const getProductImage = (product) => {
    if (!product) {
      return `${import.meta.env.VITE_PUBLIC_URL}/assets/images/default-product.jpg`;
    }
    
    // First try the productImage field
    if (product.productImage) {
      return product.productImage;
    }
    
    // If no image is provided, use a fallback based on product ID
    const productId = product.id || 1;
    return `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-${productId % 5 || 1}.jpg`;
  };

  const updateQuantity = (productId, newQuantity) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  const calculateTotal = (product) => {
    const quantity = quantities[product.id] || 1;
    return (product.price * quantity).toFixed(2);
  };

  const handleRemoveClick = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemoveItem && window.confirm("Are you sure you want to remove this item from your wishlist?")) {
      onRemoveItem(productId);
    }
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className={`w-full ${className || ""}`}>
      <div className="relative w-full overflow-x-auto border border-[#EDEDED]">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <tbody>
            <tr className="text-[13px] font-medium text-black bg-[#F6F6F6] whitespace-nowrap px-2 border-b default-border-bottom uppercase">
              <td className="py-4 pl-10 block whitespace-nowrap  w-[380px]">product</td>
              <td className="py-4 whitespace-nowrap text-center">color</td>
              <td className="py-4 whitespace-nowrap text-center">size</td>
              <td className="py-4 whitespace-nowrap text-center">price</td>
              <td className="py-4 whitespace-nowrap  text-center">quantity</td>
              <td className="py-4 whitespace-nowrap  text-center">total</td>
              <td className="py-4 whitespace-nowrap text-right w-[114px] block"></td>
            </tr>
            
            {products && products.length > 0 ? (
              products.map((product) => {
                const imageUrl = getProductImage(product);
                console.log(`Product ${product.id} image URL:`, imageUrl);
                
                return (
                  <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="pl-10 py-4">
                      <div className="flex space-x-6 items-center">
                        <div className="w-[80px] h-[80px] overflow-hidden flex justify-center items-center border border-[#EDEDED]">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              console.error(`Failed to load image for product ${product.id}:`, imageUrl);
                              e.target.src = `${import.meta.env.VITE_PUBLIC_URL}/assets/images/default-product.jpg`;
                            }}
                          />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <p className="font-medium text-[15px] text-qblack">
                            {product.name}
                          </p>
                          {product.description && (
                            <p className="text-[13px] text-qgray mt-1">
                              {product.description.length > 50 
                                ? `${product.description.substring(0, 50)}...` 
                                : product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 px-2">
                      <div className="flex justify-center items-center">
                        {product.color ? (
                          <span 
                            className="w-[20px] h-[20px] block rounded-full border border-gray-300"
                            style={{ backgroundColor: product.color }}
                            title={product.colorName || product.color}
                          ></span>
                        ) : (
                          <span className="text-[13px] text-qgray">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-4 px-2">
                      <div className="flex space-x-1 items-center justify-center">
                        <span className="text-[15px] font-normal">
                          {product.size || "Standard"}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-2">
                      <div className="flex space-x-1 items-center justify-center">
                        <span className="text-[15px] font-normal">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-center items-center">
                        <InputQuantityCom 
                          quantity={quantities[product.id] || 1}
                          onQuantityChange={(newQuantity) => updateQuantity(product.id, newQuantity)}
                        />
                      </div>
                    </td>
                    <td className="text-right py-4">
                      <div className="flex space-x-1 items-center justify-center">
                        <span className="text-[15px] font-normal">
                          {formatPrice(calculateTotal(product))}
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-4">
                      <div className="flex space-x-1 items-center justify-center">
                        <button 
                          onClick={(e) => handleRemoveClick(product.id, e)}
                          className="text-qgray hover:text-qred transition-colors duration-200"
                          aria-label="Remove item"
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
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="py-8 text-center">
                  <div className="text-qgray">No products found in your wishlist.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}