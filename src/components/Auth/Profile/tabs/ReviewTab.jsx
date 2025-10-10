import React, { useState } from "react";
import { reviewAPI } from "../../../../services/api";
import Star from "../../../Helpers/icons/Star";
import { Link } from "react-router-dom";

export default function ReviewTab({ 
  className, 
  reviewsData = [], 
  loading = false, 
  error = null, 
  onRefresh 
}) {
  const [deletingReviews, setDeletingReviews] = useState(new Set());

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    setDeletingReviews(prev => new Set(prev).add(reviewId));
    
    try {
      const response = await reviewAPI.deleteReview(reviewId);
      if (response.success) {
        // Refresh reviews data
        if (onRefresh) {
          onRefresh();
        }
      } else {
        alert(response.message || "Failed to delete review");
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      alert(err.message || "Failed to delete review");
    } finally {
      setDeletingReviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="review-tab-wrapper w-full">
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-qblack"></div>
        </div>
        <p className="text-center text-qgray">Loading your reviews...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="review-tab-wrapper w-full">
        <div className="text-center py-10">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button 
            onClick={onRefresh}
            className="yellow-btn px-6 py-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!reviewsData || reviewsData.length === 0) {
    return (
      <div className="review-tab-wrapper w-full">
        <div className="text-center py-10">
          <div className="text-qgray text-lg mb-4">You haven't written any reviews yet</div>
          <p className="text-qgray mb-6">Share your thoughts on products you've purchased!</p>
          <a href="/products" className="yellow-btn px-6 py-2">
            Browse Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="review-tab-wrapper w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviewsData.map((review) => {
            const isDeleting = deletingReviews.has(review.id);
            const product = review.product || {};
            
            return (
              <div key={review.id} className="item">
                <div
                  style={{ boxShadow: "0px 15px 64px rgba(0, 0, 0, 0.05)" }}
                  className={`product-row-card-style-one w-full bg-white group relative overflow-hidden rounded-lg border ${
                    className || ""
                  }`}
                >
                  <div className="flex space-x-4 items-start w-full p-6">
                    <div className="w-1/4 h-24 flex-shrink-0">
                      <img
                        src={product.image || product.imageUrl || `${import.meta.env.VITE_PUBLIC_URL}/assets/images/placeholder-product.jpg`}
                        alt={product.name || product.title}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = `${import.meta.env.VITE_PUBLIC_URL}/assets/images/placeholder-product.jpg`;
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-qgray text-sm mb-1.5 block">
                            {formatDate(review.createdAt || review.date)}
                          </span>
                          {/* reviews */}
                          <div className="flex mb-2">
                            {Array.from({ length: 5 }, (_, index) => (
                              <span key={index}>
                                <Star 
                                  filled={index < (review.rating || review.stars)} 
                                />
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={isDeleting}
                          className={`p-2 rounded ${
                            isDeleting 
                              ? 'bg-gray-300 cursor-not-allowed' 
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                          title="Delete Review"
                        >
                          {isDeleting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path
                                d="M13 1L1 13M1 1L13 13"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      
                      <Link to={`/product/${product.id}`}>
                        <p className="title mb-2 text-[15px] font-600 text-qblack leading-[24px] line-clamp-1 hover:text-blue-600">
                          {product.name || product.title || "Product"}
                        </p>
                      </Link>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-qblack">
                          {review.title || "My Review"}
                        </p>
                      </div>
                      
                      <p className="text-sm text-qgray line-clamp-3 leading-relaxed">
                        {review.comment || review.content || review.description || 
                         "No review content provided."}
                      </p>
                      
                      {/* Review status */}
                      {review.status && (
                        <div className="mt-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            review.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            review.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            review.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {review.status.charAt(0) + review.status.slice(1).toLowerCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Load More Button (if pagination is implemented) */}
        {reviewsData.length >= 6 && (
          <div className="w-full mt-8 flex justify-center">
            <button className="yellow-btn px-6 py-2">
              Load More Reviews
            </button>
          </div>
        )}
      </div>
    </>
  );
}