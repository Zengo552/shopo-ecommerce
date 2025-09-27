import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { productAPI, shopAPI, categoryAPI } from '../../../services/api';

export default function SearchBox({ className, type }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({
    products: [],
    shops: [],
    categories: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const searchRef = useRef(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const performSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults({ products: [], shops: [], categories: [] });
      setError(null);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Perform all searches in parallel with proper error handling
      const searchPromises = [
        // Search products with the selected category filter if applicable
        productAPI.search(
          searchTerm,
          selectedCategory !== 'All Categories' ? selectedCategory : null
        ).catch(error => {
          console.error("Product search error:", error);
          return { success: false, products: [] };
        }),
        
        // Search shops - using the correct function name searchShops
        shopAPI.searchShops(searchTerm).catch(error => {
          console.error("Shop search error:", error);
          return { success: false, shops: [] };
        }),
        
        // Search categories - using the correct function name searchCategories
        categoryAPI.searchCategories(searchTerm).catch(error => {
          console.error("Category search error:", error);
          return { success: false, categories: [] };
        })
      ];

      const [productsResponse, shopsResponse, categoriesResponse] = await Promise.all(searchPromises);

      const results = {
        products: productsResponse.success ? productsResponse.products || [] : [],
        shops: shopsResponse.success ? shopsResponse.shops || shopsResponse.data || [] : [],
        categories: categoriesResponse.success ? categoriesResponse.categories || categoriesResponse.data || [] : []
      };

      setSearchResults(results);
      setShowResults(true);
    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message);
      setSearchResults({ products: [], shops: [], categories: [] });
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search to avoid too many API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        performSearch();
      } else {
        setSearchResults({ products: [], shops: [], categories: [] });
        setShowResults(false);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      performSearch();
    }
  };

  const handleResultClick = () => {
    // Hide results when a result is clicked
    setShowResults(false);
    setSearchTerm('');
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setShowResults(false); // Close results when category changes
  };

  // Updated categories from the DOCX file
  const categories = [
    'All Categories',
    'Mobile and Laptop',
    'Gaming Entertainment',
    'Image and Video',
    'Vehicles',
    'Furnitures',
    'Sports',
    'Food and Drinks',
    'Fashion Accessories',
    'Toilet and Sanitation',
    'Makeup corner',
    'Baby Items'
  ];

  const totalResults = searchResults.products.length + 
                      searchResults.shops.length + 
                      searchResults.categories.length;

  return (
    <div className="relative" ref={searchRef}>
      <div
        className={`w-full h-full flex items-center border border-qgray-border bg-white ${
          className || ""
        }`}
      >
        <div className="flex-1 h-full">
          <form className="h-full" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              className="search-input h-full w-full px-4 focus:outline-none"
              placeholder="Search Product..."
              value={searchTerm}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => searchTerm && setShowResults(true)}
            />
          </form>
        </div>
        <div className="w-[1px] h-[22px] bg-qgray-border"></div>
        
        {/* Categories Dropdown */}
        <div className="flex-1 flex items-center px-4 relative group">
          <button
            type="button"
            className="w-full text-xs font-500 text-qgray flex justify-between items-center"
          >
            <span>{selectedCategory}</span>
            <span>
              <svg
                width="10"
                height="5"
                viewBox="0 0 10 5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="9.18359"
                  y="0.90918"
                  width="5.78538"
                  height="1.28564"
                  transform="rotate(135 9.18359 0.90918)"
                  fill="#8E8E8E"
                />
                <rect
                  x="5.08984"
                  y="5"
                  width="5.78538"
                  height="1.28564"
                  transform="rotate(-135 5.08984 5)"
                  fill="#8E8E8E"
                />
              </svg>
            </span>
          </button>
          
          {/* Categories Dropdown Menu */}
          <div className="absolute top-full left-0 right-0 bg-white border border-qgray-border shadow-lg mt-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 max-h-60 overflow-y-auto">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100"
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <button
          className={`w-[93px] h-full text-sm font-600 ${type === 3 ? 'bg-qh3-blue text-white' : 'search-btn'}`}
          type="button"
          onClick={performSearch}
        >
          Search
        </button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-qgray-border shadow-lg rounded-md max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          )}
          
          {error && (
            <div className="p-4 text-center text-red-500">Error: {error}</div>
          )}
          
          {!loading && !error && totalResults > 0 && (
            <div>
              {/* Products Results */}
              {searchResults.products.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 border-b">
                    Products ({searchResults.products.length})
                  </div>
                  <ul>
                    {searchResults.products.map((product) => (
                      <li key={`product-${product.id}`} className="border-b border-qgray-border last:border-b-0">
                        <Link 
                          to={`/single-product/${product.id}`} // Use React Router Link
                          className="flex items-center p-3 hover:bg-gray-100 transition-colors"
                          onClick={handleResultClick}
                        >
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-12 h-12 object-cover rounded mr-3"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-sm text-qblack">{product.name}</div>
                            <div className="text-qred font-semibold">${product.price}</div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Shops Results */}
              {searchResults.shops.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 border-b">
                    Shops ({searchResults.shops.length})
                  </div>
                  <ul>
                    {searchResults.shops.map((shop) => (
                      <li key={`shop-${shop.id}`} className="border-b border-qgray-border last:border-b-0">
                        <Link 
                          to={`/saller-page/${shop.id}`} // Use React Router Link
                          className="flex items-center p-3 hover:bg-gray-100 transition-colors"
                          onClick={handleResultClick}
                        >
                          {shop.logo && (
                            <img 
                              src={shop.logo} 
                              alt={shop.name} 
                              className="w-12 h-12 object-cover rounded mr-3"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-sm text-qblack">{shop.name}</div>
                            <div className="text-gray-500 text-xs">{shop.description}</div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Categories Results */}
              {searchResults.categories.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 border-b">
                    Categories ({searchResults.categories.length})
                  </div>
                  <ul>
                    {searchResults.categories.map((category) => (
                      <li key={`category-${category.id}`} className="border-b border-qgray-border last:border-b-0">
                        <Link 
                          to={`/category/${category.id}`} // Use React Router Link
                          className="flex items-center p-3 hover:bg-gray-100 transition-colors"
                          onClick={handleResultClick}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm text-qblack">{category.name}</div>
                            {category.description && (
                              <div className="text-gray-500 text-xs">{category.description}</div>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {!loading && !error && searchTerm && totalResults === 0 && (
            <div className="p-4 text-center text-gray-500">
              No results found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}