// components/Admin/Products/EditProduct.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productAPI, categoryAPI, shopAPI } from '../../../services/api';
import './ProductForm.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
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
    fetchProduct();
    fetchCategories();
    fetchShops();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      setProduct(response);
      setFormData({
        name: response.name || '',
        description: response.description || '',
        price: response.price || '',
        originalPrice: response.originalPrice || '',
        stockQuantity: response.stockQuantity || response.stock || '',
        categoryId: response.categoryId || response.category?.id || '',
        shopId: response.shopId || response.shop?.id || ''
      });
      
      // Set existing image preview
      if (response.image) {
        setImagePreview(response.image);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

      console.log('Updating product:', productData);
      
      await productAPI.updateProduct(id, productData, imageFile);
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <div className="loading-spinner">Loading product...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <div className="breadcrumb">
            <Link to="/admin/products" className="breadcrumb-link">Products</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Edit Product</span>
          </div>
          <h1 className="page-title">Edit Product</h1>
          <p className="page-description">Update product information and settings</p>
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
                />
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
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Product Image</h3>
            <div className="form-group">
              <label className="form-label">Product Image</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="productImage"
                  name="image"
                  className="file-input"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label htmlFor="productImage" className="file-upload-label">
                  <div className="file-upload-content">
                    <span className="file-upload-icon">📷</span>
                    <span className="file-upload-text">
                      {imageFile ? imageFile.name : 'Choose new image (optional)'}
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
                  <div className="image-preview-info">
                    {imageFile ? 'New image preview' : 'Current product image'}
                  </div>
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
                  Updating Product...
                </>
              ) : (
                'Update Product'
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

export default EditProduct;