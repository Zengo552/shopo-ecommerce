// src/pages/AllProduct.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import BreadcrumbCom from "../BreadcrumbCom";
import { useAuth } from "../../contexts/AuthProvider";
import ProductCardStyleOne from "../Helpers/Cards/ProductCardStyleOne";
import Layout from "../Partials/Layout";
import ProductsFilter from "./ProductsFilter";
import { productAPI } from "../../services/api";

export default function AllProductPage() {
  const { user, isAuthenticated } = useAuth();
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Enhanced filter state with URL synchronization
  const [filters, setFilters] = useState({
    minPrice: null,
    maxPrice: null,
    category: null,
    minRating: null,
    search: null,
    brands: [], // Changed to array for multiple brand selection
  });
  
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterToggle, setFilterToggle] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Memoized URL parameter parsing
  const urlParams = useMemo(() => ({
    search: searchParams.get('q'),
    category: searchParams.get('category'),
    minPrice: searchParams.get('minPrice'),
    maxPrice: searchParams.get('maxPrice'),
    brands: searchParams.get('brands')?.split(',') || [],
    sort: searchParams.get('sort'),
    page: searchParams.get('page'),
  }), [searchParams]);

  // Initialize filters from URL
  useEffect(() => {
    const newFilters = { ...filters };
    
    if (urlParams.search) newFilters.search = urlParams.search;
    if (urlParams.category) newFilters.category = urlParams.category;
    if (urlParams.minPrice) newFilters.minPrice = parseFloat(urlParams.minPrice);
    if (urlParams.maxPrice) newFilters.maxPrice = parseFloat(urlParams.maxPrice);
    if (urlParams.brands.length > 0) newFilters.brands = urlParams.brands;
    
    if (categoryId) newFilters.category = categoryId;
    
    setFilters(newFilters);
    
    if (urlParams.sort) {
      const [sort, order] = urlParams.sort.split('-');
      setSortBy(sort);
      setSortOrder(order);
    }
    
    if (urlParams.page) {
      setCurrentPage(parseInt(urlParams.page));
    }
  }, [categoryId, urlParams]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('q', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.brands.length > 0) params.set('brands', filters.brands.join(','));
    
    params.set('sort', `${sortBy}-${sortOrder}`);
    params.set('page', currentPage.toString());
    
    navigate(`?${params.toString()}`, { replace: true });
  }, [filters, sortBy, sortOrder, currentPage, navigate]);

  // Debounced fetch function
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        ...filters,
        sortBy,
        order: sortOrder,
        page: currentPage,
        limit: 12
      };
      
      // Clean up parameters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === null || queryParams[key] === undefined || 
            queryParams[key] === '' || (Array.isArray(queryParams[key]) && queryParams[key].length === 0)) {
          delete queryParams[key];
        }
      });

      let response;
      
      if (categoryId) {
        response = await productAPI.getByCategory(categoryId, queryParams);
      } else if (filters.search) {
        response = await productAPI.search(filters.search, queryParams);
      } else {
        response = await productAPI.getAll(queryParams);
      }
      
      if (response.success) {
        setProducts(response.products || []);
        setTotalPages(response.totalPages || 1);
        setTotalProducts(response.totalItems || 0);
        setHasMore(response.hasMore || currentPage < (response.totalPages || 1));
      } else {
        setError(response.message || "Failed to load products");
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err.message || "Network error. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder, currentPage, categoryId]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchProducts, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [fetchProducts]);

  // Enhanced filter handlers
  const checkboxHandler = (e) => {
    const { name, checked, type } = e.target;
    
    if (type === 'checkbox') {
      setFilters(prev => {
        if (name === 'category') {
          return { ...prev, category: checked ? e.target.value : null };
        } else if (name === 'brand') {
          const brands = checked 
            ? [...prev.brands, e.target.value]
            : prev.brands.filter(brand => brand !== e.target.value);
          return { ...prev, brands };
        }
        return prev;
      });
    }
    
    setCurrentPage(1);
  };

  const priceRangeHandler = useCallback((range) => {
    setFilters(prev => ({
      ...prev,
      minPrice: range.min,
      maxPrice: range.max
    }));
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  }, [sortBy, sortOrder]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      minPrice: null,
      maxPrice: null,
      category: null,
      minRating: null,
      search: null,
      brands: [],
    });
    setCurrentPage(1);
    setSortBy('createdAt');
    setSortOrder('desc');
    navigate('/all-products'); // Reset URL
  }, [navigate]);

  // Memoized breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const items = [
      { name: "home", path: "/" },
      { name: "products", path: "/all-products" }
    ];

    if (filters.category) {
      items.push({ 
        name: filters.category.toLowerCase(), 
        path: `/all-products?category=${filters.category}`
      });
    }

    if (filters.search) {
      items.push({ 
        name: `search: "${filters.search}"`, 
        path: `/all-products?q=${filters.search}`
      });
    }

    return items;
  }, [filters.category, filters.search]);

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5 mb-[40px]">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-200 h-80 animate-pulse rounded-lg">
          <div className="h-48 bg-gray-300 rounded-t-lg"></div>
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 mb-10">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2 border rounded transition-colors ${
              currentPage === page
                ? 'bg-qyellow border-qyellow text-qblack font-semibold'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  if (error && currentPage === 1) {
    return (
      <Layout>
        <div className="container-x mx-auto py-10 text-center">
          <div className="text-red-500 text-lg mb-4">Error: {error}</div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
          >
            Reset Filters
          </button>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  const isEmpty = products.length === 0 && !loading;

  return (
    <Layout>
      <div className="products-page-wrapper w-full">
        <div className="container-x mx-auto">
          <BreadcrumbCom paths={breadcrumbItems} />
          
          <div className="w-full lg:flex lg:space-x-[30px]">
            {/* Filter Sidebar */}
            <div className={`lg:w-[270px] ${filterToggle ? 'block' : 'hidden lg:block'}`}>
              <ProductsFilter
                filterToggle={filterToggle}
                filterToggleHandler={() => setFilterToggle(!filterToggle)}
                filters={filters}
                checkboxHandler={checkboxHandler}
                volume={{ min: filters.minPrice || 10, max: filters.maxPrice || 1000 }}
                volumeHandler={priceRangeHandler}
                className="mb-[30px]"
                onReset={resetFilters}
              />
              
              {/* Promotional Banner */}
              <div className="w-full hidden lg:block h-[295px] mb-4">
                <img
                  src={`${import.meta.env.VITE_PUBLIC_URL}/assets/images/bannera-5.png`}
                  alt="Special offers"
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Sorting Header */}
              <div className="products-sorting w-full bg-white md:h-[70px] flex md:flex-row flex-col md:space-y-0 space-y-5 md:justify-between md:items-center p-[30px] mb-[40px] rounded-lg shadow-sm">
                <div>
                  <p className="font-400 text-[13px]">
                    <span className="text-qgray">Showing</span> {(currentPage - 1) * 12 + 1}–{Math.min(currentPage * 12, totalProducts)} of {totalProducts} results
                  </p>
                  {(filters.category || filters.search || filters.brands.length > 0) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {filters.category && `Category: ${filters.category} `}
                      {filters.search && `Search: "${filters.search}" `}
                      {filters.brands.length > 0 && `Brands: ${filters.brands.join(', ')}`}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-3 items-center">
                  <span className="font-400 text-[13px]">Sort by:</span>
                  <select 
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newOrder] = e.target.value.split('-');
                      setSortBy(newSortBy);
                      setSortOrder(newOrder);
                    }}
                    className="text-[13px] text-qgray border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="rating-desc">Highest Rated</option>
                    <option value="popularity-desc">Most Popular</option>
                  </select>
                </div>
                
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setFilterToggle(!filterToggle)}
                  type="button"
                  className="w-10 lg:hidden h-10 rounded flex justify-center items-center border border-qyellow text-qyellow hover:bg-qyellow hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </button>
              </div>
              
              {/* Products Grid */}
              {loading && currentPage === 1 ? (
                renderSkeleton()
              ) : isEmpty ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                  <div className="text-6xl mb-4">😢</div>
                  <p className="text-qgray text-lg mb-4">No products found with the selected filters.</p>
                  <button 
                    onClick={resetFilters}
                    className="px-6 py-2 bg-qyellow text-qblack rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5 mb-[40px]">
                    {products.map((product) => (
                      <div data-aos="fade-up" key={product.id}>
                        <ProductCardStyleOne datas={product} />
                      </div>
                    ))}
                  </div>

                  <Pagination />

                  {/* Promotional Banner */}
                  <div className="w-full h-[164px] overflow-hidden mb-[40px] rounded-lg">
                    <img
                      src={`${import.meta.env.VITE_PUBLIC_URL}/assets/images/bannera-6.png`}
                      alt="Special promotion"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}