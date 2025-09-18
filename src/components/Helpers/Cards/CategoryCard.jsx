import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { categoryService } from "../../../services/categoryService"; // Fixed path

export default function CategoryCard({ 
  background, 
  title, 
  brands = [], 
  categoryId, 
  showAll = true 
}) {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch category data if categoryId is provided
  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  const fetchCategoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const categoryData = await categoryService.getCategoryById(categoryId);
      if (categoryData) {
        setCategory(categoryData);
      } else {
        setError('Category not found');
      }
    } catch (err) {
      setError('Failed to load category');
      console.error('Error fetching category:', err);
    } finally {
      setLoading(false);
    }
  };

  // Use provided props or fallback to fetched category data
  const displayTitle = title || category?.name || 'Category';
  const displayBackground = background || category?.imageUrl || 
    `${import.meta.env.VITE_PUBLIC_URL}/assets/images/section-category-1.jpg`;
  
  // Use provided brands or generate some from category data
  const displayBrands = brands.length > 0 ? brands : 
    category?.brands?.split(',')?.slice(0, 4) || ['Apple', 'Samsung', 'Sony', 'LG'];

  if (loading) {
    return (
      <div className="category-card-wrappwer w-full h-full p-[30px] bg-gray-200 animate-pulse rounded-lg">
        <div className="h-6 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-2 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded"></div>
          ))}
        </div>
        <div className="flex space-x-2 items-center">
          <div className="h-4 w-16 bg-gray-300 rounded"></div>
          <div className="h-4 w-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !categoryId) {
    return (
      <div className="category-card-wrappwer w-full h-full p-[30px] bg-red-50 rounded-lg">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div
      className="category-card-wrappwer w-full h-full p-[30px] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
      style={{
        background: `url(${displayBackground}) no-repeat center center`,
        backgroundSize: "cover",
        position: 'relative',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg"></div>
      
      <div className="relative z-10">
        <h1 className="text-base font-semibold tracking-wide mb-4 text-white drop-shadow-md">
          {displayTitle}
        </h1>
        
        <div className="brands-list mb-6">
          <ul className="space-y-1">
            {displayBrands.slice(0, 4).map((brand, index) => (
              <li key={`${brand}-${index}`}>
                <Link 
                  to={`/all-products?category=${encodeURIComponent(displayTitle)}&brand=${encodeURIComponent(brand)}`}
                  className="block"
                >
                  <span className="text-sm text-gray-100 hover:text-white border-b border-transparent hover:border-white transition-all duration-200 capitalize">
                    {brand.trim()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {showAll && (
          <Link to={`/all-products?category=${encodeURIComponent(displayTitle)}`}>
            <div className="flex space-x-2 items-center group">
              <span className="text-white font-semibold text-sm group-hover:underline transition-all duration-200">
                Shop Now
              </span>
              <span className="transform group-hover:translate-x-1 transition-transform duration-200">
                <svg
                  width="7"
                  height="11"
                  viewBox="0 0 7 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <rect
                    x="2.08984"
                    y="0.636719"
                    width="6.94219"
                    height="1.54271"
                    transform="rotate(45 2.08984 0.636719)"
                    fill="currentColor"
                  />
                  <rect
                    x="7"
                    y="5.54492"
                    width="6.94219"
                    height="1.54271"
                    transform="rotate(135 7 5.54492)"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}