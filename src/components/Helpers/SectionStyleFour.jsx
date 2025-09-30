// components/Helpers/SectionStyleFour.jsx (Admin modifications)
import React from "react";
import ProductCard from "../ProductCard";

export default function SectionStyleFour({
  products,
  sectionTitle,
  seeMoreUrl,
  className,
  adminMode = false
}) {
  return (
    <div className={`${className}`}>
      <div className="section-title flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-qblacktext">{sectionTitle}</h2>
        {seeMoreUrl && (
          <a href={seeMoreUrl}>
            <span className="text-qred text-sm font-semibold">See All</span>
          </a>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.slice(0, 4).map((product) => (
          <div key={product.id} className="relative">
            {adminMode && (
              <div className="absolute top-2 right-2 z-10">
                <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  Popular
                </span>
              </div>
            )}
            <ProductCard product={product} />
            {adminMode && (
              <div className="mt-2 text-center">
                <span className="text-green-600 font-semibold">45 Sales</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}