// components/Admin/Categories/index.jsx
import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../../services/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategoriesWithoutPagination();
      setCategories(response.categories || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // You'll need to add a create category endpoint to your API
      await categoryAPI.createCategory(formData);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      fetchCategories(); // Refresh the list
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category: ' + error.message);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        // You'll need to add a delete category endpoint to your API
        await categoryAPI.deleteCategory(categoryId);
        setCategories(categories.filter(c => c.id !== categoryId));
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  if (loading) {
    return <div className="admin-card">Loading categories...</div>;
  }

  return (
    <div>
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Categories Management</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add New Category'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success">Create Category</button>
          </form>
        )}

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Product Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>
                  <strong>{category.name}</strong>
                </td>
                <td>{category.description || 'No description'}</td>
                <td>{category.productCount || 0}</td>
                <td>
                  <button 
                    onClick={() => handleDelete(category.id)}
                    className="btn btn-danger"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
            No categories found
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;