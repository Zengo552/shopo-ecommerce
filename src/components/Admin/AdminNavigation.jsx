// components/Admin/AdminNavigation.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';

const AdminNavigation = () => {
  const { isAdmin, user } = useAuth();

  if (!isAdmin) return null;

  return (
    <div className="admin-quick-nav bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-purple-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Admin Panel
          </h3>
          <p className="text-sm text-purple-600 mt-1">
            Welcome back, {user?.name || user?.email}! Quick access to admin features.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link 
            to="/admin/dashboard"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
          
          <Link 
            to="/admin/products"
            className="px-4 py-2 bg-white text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            Products
          </Link>
          
          <Link 
            to="/admin/orders"
            className="px-4 py-2 bg-white text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Orders
          </Link>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-purple-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="text-center">
            <div className="text-purple-600 font-semibold">Products</div>
            <Link to="/admin/products" className="text-purple-400 hover:text-purple-600">Manage</Link>
          </div>
          <div className="text-center">
            <div className="text-purple-600 font-semibold">Orders</div>
            <Link to="/admin/orders" className="text-purple-400 hover:text-purple-600">View</Link>
          </div>
          <div className="text-center">
            <div className="text-purple-600 font-semibold">Users</div>
            <Link to="/admin/users" className="text-purple-400 hover:text-purple-600">Manage</Link>
          </div>
          <div className="text-center">
            <div className="text-purple-600 font-semibold">Analytics</div>
            <Link to="/admin/analytics" className="text-purple-400 hover:text-purple-600">View</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;