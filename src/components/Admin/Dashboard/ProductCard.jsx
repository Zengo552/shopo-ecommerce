// components/Admin/Dashboard/ProductCard.jsx
import React from "react";

export default function AdminProductCard({ product, showActions = true }) {
  return (
    <div className="product-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="product-img relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.status && (
          <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
            product.status === 'active' ? 'bg-green-500 text-white' :
            product.status === 'inactive' ? 'bg-red-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {product.status}
          </span>
        )}
      </div>
      
      <div className="product-content p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="product-name text-sm font-medium text-qblacktext line-clamp-2">
            {product.name}
          </h3>
          <span className="text-xs text-qgray">#{product.id}</span>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <span className="price text-qred font-semibold">${product.price}</span>
          <span className="stock text-xs text-qgray">Stock: {product.stock || 'N/A'}</span>
        </div>
        
        <div className="category text-xs text-qgray mb-3">
          Category: {product.category || 'Uncategorized'}
        </div>

        {showActions && (
          <div className="admin-actions flex gap-2">
            <button className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors">
              Edit
            </button>
            <button className="flex-1 bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors">
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}