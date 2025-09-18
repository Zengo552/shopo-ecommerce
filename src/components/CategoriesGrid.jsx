// src/components/CategoriesGrid.jsx
import { useState, useEffect } from 'react';
import CategoryCard from './CategoryCard';
import { categoryService } from '../services/categoryService';

export default function CategoriesGrid() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesData = await categoryService.getAllCategories(1, 8);
      setCategories(categoriesData);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <CategoryCard key={i} loading />
      ))}
    </div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          categoryId={category.id}
          title={category.name}
          background={category.imageUrl}
        />
      ))}
    </div>
  );
}