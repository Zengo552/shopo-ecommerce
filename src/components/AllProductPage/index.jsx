// src/pages/AllProduct.jsx
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom"; // Added hooks
import BreadcrumbCom from "../BreadcrumbCom";
import ProductCardStyleOne from "../Helpers/Cards/ProductCardStyleOne";
import Layout from "../Partials/Layout";
import ProductsFilter from "./ProductsFilter";
import { productAPI } from "../../services/api";

export default function AllProductPage() {
  const { categoryId } = useParams(); // Get category ID from URL
  const [searchParams] = useSearchParams(); // Get search params from URL
  
  const [filters, setFilter] = useState({
    minPrice: null,
    maxPrice: null,
    category: null,
    minRating: null,
    search: null,
  });
  
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterToggle, setToggle] = useState(false);

  // Handle URL parameters on component mount
  useEffect(() => {
    const searchQuery = searchParams.get('q');
    const categoryFromUrl = searchParams.get('category');
    const minPriceFromUrl = searchParams.get('minPrice');
    const maxPriceFromUrl = searchParams.get('maxPrice');
    
    if (searchQuery) {
      setFilter(prev => ({ ...prev, search: searchQuery }));
    }
    
    if (categoryFromUrl) {
      setFilter(prev => ({ ...prev, category: categoryFromUrl }));
    }
    
    if (minPriceFromUrl) {
      setFilter(prev => ({ ...prev, minPrice: parseFloat(minPriceFromUrl) }));
    }
    
    if (maxPriceFromUrl) {
      setFilter(prev => ({ ...prev, maxPrice: parseFloat(maxPriceFromUrl) }));
    }
    
    if (categoryId) {
      setFilter(prev => ({ ...prev, category: categoryId }));
    }
  }, [categoryId, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [filters, sortBy, sortOrder, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = {
        ...filters,
        sortBy,
        order: sortOrder,
        page: currentPage,
        limit: 12
      };
      
      // Remove null/undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key];
        }
      });

      let response;
      
      // If we have a category ID from URL, use category-specific endpoint
      if (categoryId) {
        response = await productAPI.getByCategory(categoryId, {
          page: currentPage,
          limit: 12,
          sortBy,
          order: sortOrder,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minRating: filters.minRating
        });
      } 
      // If we have a search query, use search endpoint
      else if (filters.search) {
        response = await productAPI.search(
          filters.search,
          filters.category,
          filters.minPrice,
          filters.maxPrice,
          {
            page: currentPage,
            limit: 12,
            sortBy,
            order: sortOrder
          }
        );
      }
      // Otherwise use general products endpoint
      else {
        response = await productAPI.getAll(queryParams);
      }
      
      if (response.success) {
        setProducts(response.products || []);
        setTotalPages(response.totalPages || 1);
        setTotalProducts(response.totalItems || response.products?.length || 0);
      } else {
        setError(response.message || "Failed to load products");
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Map UI filter names to API parameter names
  const filterMap = {
    mobileLaptop: 'Electronics',
    gaming: 'Gaming',
    imageVideo: 'Media',
    vehicles: 'Vehicles',
    furnitures: 'Furniture',
    sport: 'Sports',
    foodDrinks: 'Food',
    fashion: 'Fashion',
    toilet: 'Toiletries',
    makeupCorner: 'Makeup',
    babyItem: 'Baby',
    apple: 'Apple',
    samsung: 'Samsung',
    walton: 'Walton',
    oneplus: 'OnePlus',
    vivo: 'Vivo',
    oppo: 'Oppo',
    xiomi: 'Xiaomi',
    others: 'Others'
  };

  const checkboxHandler = (e) => {
    const { name, checked } = e.target;
    
    if (filterMap[name]) {
      setFilter(prev => ({
        ...prev,
        category: checked ? filterMap[name] : null
      }));
      setCurrentPage(1); // Reset to first page when filter changes
    }
  };

  const priceRangeHandler = (range) => {
    setFilter(prev => ({
      ...prev,
      minPrice: range.min,
      maxPrice: range.max
    }));
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilter({
      minPrice: null,
      maxPrice: null,
      category: null,
      minRating: null,
      search: null,
    });
    setCurrentPage(1);
    setSortBy('price');
    setSortOrder('asc');
  };

  // Generate breadcrumb items based on current filters
  const getBreadcrumbItems = () => {
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
  };

  if (loading && currentPage === 1) {
    return (
      <Layout>
        <div className="container-x mx-auto py-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading products...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container-x mx-auto py-10 text-center">
          <div className="text-red-500 text-lg mb-4">Error: {error}</div>
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

  const isEmpty = products.length === 0;

  return (
    <Layout>
      <div className="products-page-wrapper w-full">
        <div className="container-x mx-auto">
          <BreadcrumbCom paths={getBreadcrumbItems()} />
          
          <div className="w-full lg:flex lg:space-x-[30px]">
            <div className="lg:w-[270px]">
              <ProductsFilter
                filterToggle={filterToggle}
                filterToggleHandler={() => setToggle(!filterToggle)}
                filters={filters}
                checkboxHandler={checkboxHandler}
                volume={filters}
                volumeHandler={priceRangeHandler}
                className="mb-[30px]"
                onReset={resetFilters}
              />
              
              {/* ads */}
              <div className="w-full hidden lg:block h-[295px]">
                <img
                  src={`${import.meta.env.VITE_PUBLIC_URL}/assets/images/bannera-5.png`}
                  alt="Special offers"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="products-sorting w-full bg-white md:h-[70px] flex md:flex-row flex-col md:space-y-0 space-y-5 md:justify-between md:items-center p-[30px] mb-[40px] rounded-lg shadow-sm">
                <div>
                  <p className="font-400 text-[13px]">
                    <span className="text-qgray">Showing</span> {(currentPage - 1) * 12 + 1}–{Math.min(currentPage * 12, totalProducts)} of {totalProducts} results
                  </p>
                  {(filters.category || filters.search) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {filters.category && `Category: ${filters.category} `}
                      {filters.search && `Search: "${filters.search}"`}
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
                    className="text-[13px] text-qgray border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="rating-desc">Highest Rated</option>
                    <option value="createdAt-desc">Newest First</option>
                  </select>
                </div>
                
                <button
                  onClick={() => setToggle(!filterToggle)}
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
              
              {loading ? (
                <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5 mb-[40px]">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-200 h-80 animate-pulse rounded-lg"></div>
                  ))}
                </div>
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mb-10">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        // Show limited page numbers for better UX
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`px-4 py-2 border rounded transition-colors ${
                                currentPage === pageNumber
                                  ? 'bg-qyellow border-qyellow text-qblack font-semibold'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return <span key={pageNumber} className="px-2">...</span>;
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}

                  <div className="w-full h-[164px] overflow-hidden mb-[40px] rounded-lg">
                    <img
                      src={`${import.meta.env.VITE_PUBLIC_URL}/assets/images/bannera-6.png`}
                      alt="Special promotion"
                      className="w-full h-full object-cover"
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