// src/pages/ProductView.jsx
import { useState } from "react";
import Star from "../Helpers/icons/Star";
import Selectbox from "../Helpers/Selectbox";
import { cartAPI } from "../../services/api";

export default function ProductView({ product, reportHandler, className }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const increment = () => {
    setQuantity((prev) => prev + 1);
  };
  
  const decrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    try {
      const cartItem = {
        productId: product.id,
        quantity: quantity
      };
      
      await cartAPI.addOrUpdateItem(cartItem);
      // You might want to show a success message or update cart count
      console.log("Product added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const images = product.images || [
    { id: 1, src: "product-details-1.png", color: "#FFBC63" }
  ];

  return (
    <div className={`product-view w-full lg:flex justify-between ${className || ""}`}>
      {/* Product images */}
      <div data-aos="fade-right" className="lg:w-1/2 xl:mr-[70px] lg:mr-[50px]">
        <div className="w-full">
          <div className="w-full h-[600px] border border-qgray-border flex justify-center items-center overflow-hidden relative mb-3">
            <img
              src={images[selectedImage]?.src || `${import.meta.env.VITE_PUBLIC_URL}/assets/images/placeholder-product.png`}
              alt={product.name}
              className="object-contain max-h-full max-w-full"
            />
            {product.discountPercentage > 0 && (
              <div className="w-[80px] h-[80px] rounded-full bg-qyellow text-qblack flex justify-center items-center text-xl font-medium absolute left-[30px] top-[30px]">
                <span>-{product.discountPercentage}%</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {images.map((img, index) => (
              <div
                onClick={() => setSelectedImage(index)}
                key={img.id}
                className="w-[110px] h-[110px] p-[15px] border border-qgray-border cursor-pointer"
              >
                <img
                  src={img.src}
                  alt={`${product.name} view ${index + 1}`}
                  className={`w-full h-full object-contain ${selectedImage !== index ? "opacity-50" : ""}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Product details */}
      <div className="flex-1">
        <div className="product-details w-full mt-10 lg:mt-0">
          <span className="text-qgray text-xs font-normal uppercase tracking-wider mb-2 inline-block">
            {product.category?.name || "Product"}
          </span>
          
          <p className="text-xl font-medium text-qblack mb-4">
            {product.name}
          </p>

          <div className="flex space-x-[10px] items-center mb-6">
            <div className="flex">
              {Array.from({ length: Math.floor(product.averageRating || 0) }, (_, i) => (
                <Star key={i} />
              ))}
            </div>
            <span className="text-[13px] font-normal text-qblack">
              {product.reviewCount || 0} Reviews
            </span>
          </div>

          <div className="flex space-x-2 items-center mb-7">
            {product.discountPercentage > 0 && (
              <span className="text-sm font-500 text-qgray line-through mt-2">
                ${product.price}
              </span>
            )}
            <span className="text-2xl font-500 text-qred">
              ${product.discountPercentage > 0 
                ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
                : product.price}
            </span>
          </div>

          <p className="text-qgray text-sm text-normal mb-[30px] leading-7">
            {product.description || "No description available."}
          </p>

          {/* Add to cart section */}
          <div className="quantity-card-wrapper w-full flex items-center h-[50px] space-x-[10px] mb-[30px]">
            <div className="w-[120px] h-full px-[26px] flex items-center border border-qgray-border">
              <div className="flex justify-between items-center w-full">
                <button onClick={decrement} type="button" className="text-base text-qgray">
                  -
                </button>
                <span className="text-qblack">{quantity}</span>
                <button onClick={increment} type="button" className="text-base text-qgray">
                  +
                </button>
              </div>
            </div>
            
            <div className="flex-1 h-full">
              <button
                type="button"
                onClick={handleAddToCart}
                className="black-btn text-sm font-semibold w-full h-full"
              >
                Add To Cart
              </button>
            </div>
          </div>

          {/* Product details */}
          <div className="mb-[20px]">
            <p className="text-[13px] text-qgray leading-7">
              <span className="text-qblack">Category :</span> {product.category?.name || "N/A"}
            </p>
            <p className="text-[13px] text-qgray leading-7">
              <span className="text-qblack">SKU:</span> {product.sku || "N/A"}
            </p>
          </div>

          {/* Social sharing */}
          <div className="social-share flex items-center w-full">
            <span className="text-qblack text-[13px] mr-[17px] inline-block">
              Share This
            </span>
            {/* Social icons */}
          </div>
        </div>
      </div>
    </div>
  );
}