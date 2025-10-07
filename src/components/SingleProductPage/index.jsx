// src/pages/SingleProduct.jsx
import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import BreadcrumbCom from "../BreadcrumbCom";
import ProductCardStyleOne from "../Helpers/Cards/ProductCardStyleOne";
import DataIteration from "../Helpers/DataIteration";
import InputCom from "../Helpers/InputCom";
import Layout from "../Partials/Layout";
import ProductView from "./ProductView";
import Reviews from "./Reviews";
import SallerInfo from "./SallerInfo";
import { productAPI, reviewAPI, handleApiResponse } from "../../services/api";

export default function SingleProductPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState("des");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoadingState] = useState(true);
  const [error, setError] = useState(null);
  const reviewElement = useRef(null);
  const [report, setReport] = useState(false);

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoadingState(true);
      setError(null);
      
      // Fetch product data
      const productResponse = await productAPI.getById(id);
      
      if (productResponse.success) {
        // The product data structure might vary - adjust based on your actual API response
        const productData = productResponse.product || productResponse.data || productResponse;
        setProduct(productData);
        
        // Fetch reviews for this product
        try {
          const reviewsResponse = await reviewAPI.getByProduct(id);
          if (reviewsResponse.success) {
            setReviews(reviewsResponse.reviews || reviewsResponse.data || []);
          }
        } catch (reviewError) {
          console.warn("Could not fetch reviews:", reviewError);
          setReviews([]);
        }
        
        // Fetch related products by category if available
        if (productData.categoryId || productData.category?.id) {
          const categoryId = productData.categoryId || productData.category?.id;
          try {
            const relatedResponse = await productAPI.getByCategory(
              categoryId,
              { limit: 4, page: 0 }
            );
            
            if (relatedResponse.success) {
              const relatedProductsData = relatedResponse.products || relatedResponse.data || [];
              setRelatedProducts(
                relatedProductsData
                  .filter(p => p.id !== parseInt(id))
                  .slice(0, 4)
              );
            }
          } catch (relatedError) {
            console.warn("Could not fetch related products:", relatedError);
            setRelatedProducts([]);
          }
        }
      } else {
        setError(productResponse.message || "Product not found");
      }
    } catch (err) {
      console.error("Error fetching product data:", err);
      setError(err.message || "Failed to load product");
    } finally {
      setLoadingState(false);
    }
  };

  const reviewAction = async () => {
    if (!user) {
      alert("Please login to submit a review");
      return;
    }

    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    if (!message.trim()) {
      alert("Please write a review message");
      return;
    }

    setReviewLoading(true);
    try {
      const reviewData = {
        productId: parseInt(id),
        userId: user.id,
        userName: name.trim() || user.username || "Anonymous",
        userEmail: email.trim() || user.email,
        rating: rating,
        comment: message.trim()
      };

      const response = await reviewAPI.addReview(reviewData);
      
      if (response.success) {
        // Refresh reviews
        try {
          const reviewsResponse = await reviewAPI.getByProduct(id);
          if (reviewsResponse.success) {
            setReviews(reviewsResponse.reviews || reviewsResponse.data || []);
          }
        } catch (refreshError) {
          console.warn("Could not refresh reviews:", refreshError);
        }
        
        // Reset form
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        setRating(0);
        setHoverRating(0);
        
        // Scroll to reviews section
        if (reviewElement.current) {
          reviewElement.current.scrollIntoView({ 
            behavior: "smooth",
            block: "start"
          });
        }
        
        alert("Review submitted successfully!");
      } else {
        alert(response.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setReviewLoading(false);
    }
  };

  const ratingHandler = (newRating) => {
    setRating(newRating);
  };

  const hoverHandler = (newHover) => {
    setHoverRating(newHover);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-x mx-auto py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading product details...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container-x mx-auto py-20 text-center">
          <div className="text-red-500 text-lg mb-4">Error: {error}</div>
          <button
            onClick={fetchProductData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container-x mx-auto py-20 text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <a
            href="/all-products"
            className="px-6 py-2 bg-qyellow text-qblack rounded hover:bg-yellow-500"
          >
            Browse Products
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="single-product-wrapper w-full">
        <div className="product-view-main-wrapper bg-white pt-[30px] w-full">
          <div className="breadcrumb-wrapper w-full">
            <div className="container-x mx-auto">
              <BreadcrumbCom
                paths={[
                  { name: "home", path: "/" },
                  { 
                    name: product.category?.name || "category", 
                    path: `/category/${product.category?.id}` 
                  },
                  { 
                    name: product.name, 
                    path: `/single-product/${product.id}` 
                  },
                ]}
              />
            </div>
          </div>
          <div className="w-full bg-white pb-[60px]">
            <div className="container-x mx-auto">
              <ProductView 
                product={product} 
                reportHandler={() => setReport(!report)} 
              />
            </div>
          </div>
        </div>

        {/* Product Description and Reviews Section */}
        <div className="product-des-wrapper w-full bg-gray-50 py-[60px]">
          <div className="container-x mx-auto">
            <div className="w-full bg-white rounded-lg shadow-sm">
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: "des", name: "Description" },
                    { id: "addi", name: "Additional Info" },
                    { id: "reviews", name: `Reviews (${reviews.length})` },
                    { id: "seller", name: "Seller Info" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTab(item.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        tab === item.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tabs Content */}
              <div className="p-6">
                {tab === "des" && (
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description || "No description available."}
                    </p>
                    
                    {product.specifications && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-3">Specifications</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between border-b border-gray-100 pb-2">
                              <span className="text-gray-600">{key}:</span>
                              <span className="text-gray-900">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tab === "addi" && (
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Product Details</h4>
                        <div className="space-y-2">
                          {product.sku && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">SKU:</span>
                              <span className="text-gray-900">{product.sku}</span>
                            </div>
                          )}
                          {product.category?.name && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Category:</span>
                              <span className="text-gray-900">{product.category.name}</span>
                            </div>
                          )}
                          {product.stock > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Stock:</span>
                              <span className="text-gray-900">{product.stock} available</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Shipping & Returns</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          <li>Free shipping on orders over $50</li>
                          <li>30-day return policy</li>
                          <li>1-year warranty</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {tab === "reviews" && (
  <div ref={reviewElement}>
    <Reviews 
      productId={id} 
    />
  </div>
)}

                {tab === "seller" && (
                  <div>
                    <SallerInfo product={product} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="related-product w-full bg-white py-[60px]">
            <div className="container-x mx-auto">
              <div className="w-full">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                  Related Products
                </h2>
                <div
                  data-aos="fade-up"
                  className="grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-6"
                >
                  <DataIteration
                    datas={relatedProducts}
                    startLength={0}
                    endLength={relatedProducts.length}
                  >
                    {({ datas }) => (
                      <div key={datas.id} className="item">
                        <ProductCardStyleOne datas={datas} />
                      </div>
                    )}
                  </DataIteration>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {report && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Report Product</h3>
            <p className="text-gray-600 mb-4">
              Please describe the issue with this product:
            </p>
            <textarea
              className="w-full h-32 border border-gray-300 rounded p-3 mb-4"
              placeholder="Describe the issue..."
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setReport(false)}
                className="flex-1 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setReport(false);
                  alert("Report submitted successfully!");
                }}
                className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}