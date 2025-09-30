// components/Home/ProductsAds.jsx (Admin modifications)
import React from "react";

export default function ProductsAds({
  ads,
  sectionHeight,
  className,
  adminActions = false,
  systemStatus = false,
  analyticsPreview = false,
  revenue = 0
}) {
  if (adminActions) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Action 1: Add Product */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Add New Product</h3>
                <p className="text-sm opacity-90 mb-4">Create new product listings quickly</p>
                <a 
                  href="/admin/products/add"
                  className="inline-block bg-white text-green-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
                >
                  Add Product
                </a>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          {/* Quick Action 2: Manage Categories */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Manage Categories</h3>
                <p className="text-sm opacity-90 mb-4">Organize your product categories</p>
                <a 
                  href="/admin/categories"
                  className="inline-block bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
                >
                  View Categories
                </a>
              </div>
              <div className="text-4xl">📁</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (systemStatus) {
    return (
      <div className={`${className}`}>
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">System Status</h3>
              <p className="text-green-400 flex items-center justify-center md:justify-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                All systems operational
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-sm opacity-90">Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold">0.2s</div>
                <div className="text-sm opacity-90">Response</div>
              </div>
              <div>
                <div className="text-2xl font-bold">256</div>
                <div className="text-sm opacity-90">Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (analyticsPreview) {
    return (
      <div className={`${className}`}>
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Revenue Analytics</h3>
              <p className="text-xl">Total: ${revenue.toLocaleString()}</p>
            </div>
            <a 
              href="/admin/analytics"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              View Analytics
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Original ads display
  return (
    <div className={`${className}`}>
      <div className={`products-ads-wrapper w-full ${sectionHeight}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ads.map((ad, i) => (
            <div key={i} className="item">
              <a href="#">
                <img src={ad} alt="product ads" className="w-full rounded-2xl" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}