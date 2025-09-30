// components/Admin/Products/index.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../../../services/api';
import './Products.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll({}, { page: 1, limit: 50 });
      setProducts(response.products || response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // You'll need to add a delete product endpoint to your API
        await productAPI.deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const getCategories = () => {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return categories;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <div className="loading-spinner">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Products Management</h1>
          <p className="page-description">Manage your product catalog and inventory</p>
        </div>
        <Link to="/admin/products/add" className="btn btn-primary btn-lg">
          <span className="btn-icon">+</span>
          Add New Product
        </Link>
      </div>

      <div className="admin-card">
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products by name or category..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="filter-controls">
            <select 
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="product-info">Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="table-row">
                  <td className="product-cell">
                    <div className="product-info">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = '/assets/images/placeholder-product.png';
                        }}
                      />
                      <div className="product-details">
                        <h4 className="product-name">{product.name}</h4>
                        <p className="product-id">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{product.category || 'Uncategorized'}</span>
                  </td>
                  <td className="price-cell">
                    <span className="price">${parseFloat(product.price).toFixed(2)}</span>
                  </td>
                  <td>
                    <div className="stock-info">
                      <span className={`stock-badge ${product.stock > 10 ? 'in-stock' : 'low-stock'}`}>
                        {product.stock || 0}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${product.status === 'active' ? 'active' : 'inactive'}`}>
                      {product.status || 'active'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link 
                        to={`/admin/products/edit/${product.id}`}
                        className="btn btn-sm btn-outline"
                      >
                        <span className="btn-icon">✏️</span>
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="btn btn-sm btn-danger"
                      >
                        <span className="btn-icon">🗑️</span>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
              <Link to="/admin/products/add" className="btn btn-primary">
                Add Your First Product
              </Link>
            </div>
          )}
        </div>

        <div className="table-footer">
          <div className="results-count">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;