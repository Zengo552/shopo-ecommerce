// components/Admin/Products/index.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../../../services/api';
import { getProductImageUrl } from '../../Helpers/imageUtils';
import './Products.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll({}, { page: 1, limit: 50 });
      console.log('Products API Response:', response);
      
      const productsData = response.products || response.data || response || [];
      
      const productsWithImages = Array.isArray(productsData) 
        ? productsData.map(product => ({
            ...product,
            imageUrl: getProductImageUrl(product.image || product.imageUrl || product.thumbnail)
          }))
        : [];
      
      setProducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This will also remove it from user favorites and carts.')) {
      return;
    }

    setDeleteLoading(productId);
    try {
      await productAPI.deleteProduct(productId);
      
      // Remove from local state immediately for better UX
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      
      // Show success message
      alert('Product deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting product:', error);
      
      let errorMessage = 'Error deleting product: ' + error.message;
      
      // Provide more user-friendly error messages
      if (error.message.includes('foreign key constraint') || 
          error.message.includes('constraint') ||
          error.message.includes('referenced')) {
        errorMessage = 'Cannot delete product because it is currently in use by customers (in favorites or carts). Please try again or contact support.';
      } else if (error.message.includes('permission')) {
        errorMessage = 'You do not have permission to delete this product.';
      } else if (error.message.includes('not found')) {
        errorMessage = 'Product not found. It may have been already deleted.';
      }
      
      alert(errorMessage);
      
      // Refresh the list to ensure consistency
      fetchProducts();
    } finally {
      setDeleteLoading(null);
    }
  };

  const getCategories = () => {
    const categories = [...new Set(products
      .map(p => p.category?.name || p.categoryName || p.category)
      .filter(Boolean)
    )];
    return categories;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           product.category?.name === selectedCategory ||
                           product.categoryName === selectedCategory ||
                           product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleImageError = (e, product) => {
    console.error(`Failed to load image for product ${product.id}:`, e.target.src);
    
    const fallbackImages = [
      product.imageUrl,
      getProductImageUrl(product.image),
      getProductImageUrl(product.thumbnail),
      getProductImageUrl(product.imageUrl),
      '/assets/images/default-product.jpg'
    ].filter(Boolean);

    let currentIndex = fallbackImages.indexOf(e.target.src) + 1;
    
    if (currentIndex < fallbackImages.length) {
      e.target.src = fallbackImages[currentIndex];
    } else {
      e.target.src = `${import.meta.env.VITE_PUBLIC_URL || ''}/assets/images/default-product.jpg`;
      e.target.style.opacity = '0.5';
      e.target.onerror = null;
    }
  };

  const getBestImageUrl = (product) => {
    return product.imageUrl || 
           getProductImageUrl(product.image) || 
           getProductImageUrl(product.thumbnail) || 
           getProductImageUrl(product.imageUrl) ||
           `${import.meta.env.VITE_PUBLIC_URL || ''}/assets/images/default-product.jpg`;
  };

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
              {filteredProducts.map((product) => {
                const imageUrl = getBestImageUrl(product);
                
                return (
                  <tr key={product.id} className="table-row">
                    <td className="product-cell">
                      <div className="product-info">
                        <img 
                          src={imageUrl}
                          alt={product.name}
                          className="product-image"
                          onError={(e) => handleImageError(e, product)}
                        />
                        <div className="product-details">
                          <h4 className="product-name">{product.name || 'Unnamed Product'}</h4>
                          <p className="product-id">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">
                        {product.category?.name || product.categoryName || product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="price-cell">
                      <span className="price">
                        ${product.price ? parseFloat(product.price).toFixed(2) : '0.00'}
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="original-price">
                            ${parseFloat(product.originalPrice).toFixed(2)}
                          </span>
                        )}
                      </span>
                    </td>
                    <td>
                      <div className="stock-info">
                        <span className={`stock-badge ${(product.stockQuantity || product.stock) > 10 ? 'in-stock' : 'low-stock'}`}>
                          {product.stockQuantity || product.stock || 0}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${(product.status === 'active' || !product.status) ? 'active' : 'inactive'}`}>
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
                          disabled={deleteLoading === product.id}
                        >
                          <span className="btn-icon">
                            {deleteLoading === product.id ? '⏳' : '🗑️'}
                          </span>
                          {deleteLoading === product.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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