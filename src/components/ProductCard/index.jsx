// src/components/ProductCard/index.jsx
import React from "react";

export default function ProductCard({ product }) {
  return (
    <div className="product-card w-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="product-img relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.discount && (
          <span className="absolute top-2 right-2 bg-qred text-white px-2 py-1 rounded text-xs font-semibold">
            -{product.discount}%
          </span>
        )}
      </div>
      
      <div className="product-content p-4">
        <h3 className="product-name text-sm font-medium text-qblacktext line-clamp-2 mb-2">
          {product.name}
        </h3>
        
        <div className="flex justify-between items-center mb-3">
          <span className="price text-qred font-semibold">${product.price}</span>
          {product.originalPrice && (
            <span className="original-price text-qgray line-through text-sm">
              ${product.originalPrice}
            </span>
          )}
        </div>
        
        <div className="rating flex items-center mb-3">
          <div className="flex text-yellow-400">
            {"★".repeat(Math.floor(product.rating || 4))}
            {"☆".repeat(5 - Math.floor(product.rating || 4))}
          </div>
          <span className="text-xs text-qgray ml-2">({product.reviews || 0})</span>
        </div>
        
        <button className="w-full bg-qblack text-white py-2 px-4 rounded text-sm font-semibold hover:bg-qred transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  );
}