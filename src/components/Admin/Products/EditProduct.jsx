// components/Admin/Products/EditProduct.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../../../services/api';
import './ProductForm.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '',
    category: '',
    image: '',
    images: [''],
    status: 'active',
    featured: false
  });

  useEffect(() => {
    fetchProduct();
    fetchCategories();
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
        stock: response.stock || '',
        category: response.category || '',
        image: response.image || '',
        images: response.images || [''],
        status: response.status || 'active',
        featured: response.featured || false
      });
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageAdd = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const handleImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock),
        images: formData.images.filter(img => img.trim() !== '')
      };

      // You'll need to add an update product endpoint to your API
      await productAPI.updateProduct(id, productData);
      
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
        <form onSubmit={handleSubmit} className="product-form">
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
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
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
                  name="stock"
                  className="form-control"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Images</h3>
            <div className="form-group">
              <label className="form-label required">Main Image URL</label>
              <input
                type="url"
                name="image"
                className="form-control"
                value={formData.image}
                onChange={handleChange}
                required
              />
              {formData.image && (
                <div className="image-preview">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="preview-image"
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Additional Images</label>
              {formData.images.map((image, index) => (
                <div key={index} className="image-input-group">
                  <input
                    type="url"
                    className="form-control"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleImageRemove(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleImageAdd}
              >
                + Add Another Image
              </button>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Settings</h3>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  Featured Product
                </label>
              </div>
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