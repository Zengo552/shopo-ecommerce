// components/Admin/Products/AddProduct.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productAPI, categoryAPI, shopAPI } from '../../../services/api';
import './ProductForm.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    stockQuantity: '',
    categoryId: '',
    shopId: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchShops();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategoriesWithoutPagination();
      setCategories(response.categories || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchShops = async () => {
    try {
      const response = await shopAPI.getAllShops();
      setShops(response.shops || response.data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!imageFile) {
      alert('Please select a product image');
      setLoading(false);
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        categoryId: parseInt(formData.categoryId),
        shopId: parseInt(formData.shopId)
      };

      // Only add originalPrice if it has a value
      if (formData.originalPrice && formData.originalPrice !== '') {
        productData.originalPrice = parseFloat(formData.originalPrice);
      }

      console.log('Creating product:', productData);
      
      await productAPI.createProduct(productData, imageFile);
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <div className="breadcrumb">
            <Link to="/admin/products" className="breadcrumb-link">Products</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Add New Product</span>
          </div>
          <h1 className="page-title">Add New Product</h1>
          <p className="page-description">Create a new product listing for your store</p>
        </div>
      </div>

      <div className="admin-card">
        <form onSubmit={handleSubmit} className="product-form" encType="multipart/form-data">
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label required">Product Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Category</label>
                <select
                  name="categoryId"
                  className="form-control"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Shop</label>
                <select
                  name="shopId"
                  className="form-control"
                  value={formData.shopId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Shop</option>
                  {shops.map(shop => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description..."
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Pricing & Inventory</h3>
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label required">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  className="form-control"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Original Price ($)</label>
                <input
                  type="number"
                  name="originalPrice"
                  className="form-control"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
                <div className="form-help">Leave empty if no discount</div>
              </div>

              <div className="form-group">
                <label className="form-label required">Stock Quantity</label>
                <input
                  type="number"
                  name="stockQuantity"
                  className="form-control"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Product Image</h3>
            <div className="form-group">
              <label className="form-label required">Product Image</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="productImage"
                  name="image"
                  className="file-input"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
                <label htmlFor="productImage" className="file-upload-label">
                  <div className="file-upload-content">
                    <span className="file-upload-icon">📷</span>
                    <span className="file-upload-text">
                      {imageFile ? imageFile.name : 'Choose product image'}
                    </span>
                    <span className="file-upload-subtext">
                      Click to upload or drag and drop
                    </span>
                    <span className="file-upload-requirements">
                      PNG, JPG, JPEG up to 5MB
                    </span>
                  </div>
                </label>
              </div>
              
              {imagePreview && (
                <div className="image-preview">
                  <img 
                    src={imagePreview} 
                    alt="Product preview" 
                    className="preview-image"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Creating Product...
                </>
              ) : (
                'Create Product'
              )}
            </button>
            <Link 
              to="/admin/products" 
              className="btn btn-outline btn-lg"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;