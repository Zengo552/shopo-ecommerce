// components/Helpers/SectionStyleThreeHomeTwo.jsx
import React from "react";
import ProductCard from "../ProductCard"; // This should be the correct path to your existing ProductCard

export default function SectionStyleThreeHomeTwo({
  products,
  showProducts,
  sectionTitle,
  seeMoreUrl,
  className,
  adminMode = false,
  isOrders = false,
  isUsers = false
}) {
  const displayProducts = products.slice(0, showProducts);

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
        {displayProducts.map((product) => (
          <div key={product.id} className="relative">
            {adminMode && (
              <div className="absolute top-2 right-2 z-10">
                {isOrders && (
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    product.status === 'pending' ? 'bg-yellow-500 text-white' :
                    product.status === 'shipped' ? 'bg-blue-500 text-white' :
                    product.status === 'delivered' ? 'bg-green-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {product.status}
                  </span>
                )}
                {isUsers && (
                  <span className="px-2 py-1 bg-purple-500 text-white rounded text-xs font-semibold">
                    {product.role}
                  </span>
                )}
              </div>
            )}
            
            <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${
              adminMode ? 'border border-gray-200' : ''
            }`}>
              {isOrders ? (
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 rounded-lg mr-4"
                    />
                    <div>
                      <h3 className="font-semibold text-qblacktext">{product.name}</h3>
                      <p className="text-sm text-gray-600">${product.price}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Date: {new Date(product.date).toLocaleDateString()}
                  </div>
                </div>
              ) : isUsers ? (
                <div className="p-6 text-center">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-16 h-16 rounded-full mx-auto mb-4"
                  />
                  <h3 className="font-semibold text-qblacktext mb-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-qred">{product.price}</p>
                  <p className="text-sm text-gray-600 mt-2">{product.role}</p>
                </div>
              ) : (
                <ProductCard product={product} />
              )}
              
              {adminMode && !isOrders && !isUsers && (
                <div className="p-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}