// components/Admin/Dashboard/Banner.jsx
import React from "react";

export default function Banner({ className, stats }) {
  return (
    <div className={`${className}`}>
      <div className="w-full h-[300px] rounded-2xl bg-gradient-to-r from-blue-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-between px-8">
          <div className="text-white max-w-md">
            <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-xl opacity-90 mb-6">
              Manage your e-commerce store efficiently
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Quick Actions
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                View Analytics
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 text-white">
            <div className="text-center bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{stats.totalOrders}</div>
              <div className="text-sm opacity-90">Total Orders</div>
            </div>
            <div className="text-center bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">${(stats.revenue / 1000).toFixed(0)}K</div>
              <div className="text-sm opacity-90">Revenue</div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-10 rounded-full translate-y-24 -translate-x-24"></div>
      </div>
    </div>
  );
}