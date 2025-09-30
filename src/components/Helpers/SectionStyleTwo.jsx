// components/Helpers/SectionStyleTwoHomeTwo.jsx (Admin modifications)
import React from "react";
import ProductCard from "../ProductCard";

export default function SectionStyleTwo({ products, adminMode = false }) {
  return (
    <div className="section-style-two w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product.id} className="relative">
            {adminMode && (
              <div className="absolute top-2 right-2 z-10">
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  Top Seller
                </span>
              </div>
            )}
            <ProductCard product={product} />
            {adminMode && (
              <div className="mt-2 flex gap-2">
                <button className="flex-1 bg-blue-500 text-white py-1 px-2 rounded text-xs hover:bg-blue-600 transition-colors">
                  Edit
                </button>
                <button className="flex-1 bg-red-500 text-white py-1 px-2 rounded text-xs hover:bg-red-600 transition-colors">
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}