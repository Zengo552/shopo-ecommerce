// src/pages/Reviews.jsx
import { useState, useEffect } from 'react';
import Star from "../Helpers/icons/Star";
import InputCom from "../Helpers/InputCom";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import StarRating from "../Helpers/StarRating";
import { reviewAPI, reviewUtils } from "../../services/api";

export default function Reviews({ productId }) {
  // State for reviews data
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // State for review form
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  // State for UI
  const [reviewLoading, setReviewLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  // Fetch reviews when component mounts or productId changes
  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching reviews for product:', productId);
      
      const response = await reviewAPI.getByProduct(productId);
      console.log('📥 Reviews API response:', response);
      
      // Handle different response structures
      let reviewsData = [];
      let avgRating = 0;
      let total = 0;

      if (response.success) {
        // Try different possible response structures
        reviewsData = response.reviews || response.data || response.items || [];
        avgRating = response.averageRating || response.avgRating || response.rating || 0;
        total = response.totalReviews || response.total || response.count || reviewsData.length;
        
        // If no average rating in response, calculate it
        if (avgRating === 0 && reviewsData.length > 0) {
          avgRating = reviewUtils.calculateAverageRating(reviewsData);
        }
      } else if (Array.isArray(response)) {
        // Handle case where API returns array directly
        reviewsData = response;
        avgRating = reviewUtils.calculateAverageRating(reviewsData);
        total = reviewsData.length;
      } else {
        // Handle case where response is the reviews array directly
        reviewsData = response.reviews || response.data || [];
        avgRating = reviewUtils.calculateAverageRating(reviewsData);
        total = reviewsData.length;
      }

      console.log('📊 Processed reviews data:', {
        reviewsCount: reviewsData.length,
        averageRating: avgRating,
        totalReviews: total
      });

      setReviews(reviewsData);
      setAverageRating(avgRating);
      setTotalReviews(total);
      
      // Check if current user has already reviewed
      checkUserReview(reviewsData);
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      setError('Failed to load reviews. Please try again.');
      // Set empty state
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
    } finally {
      setLoading(false);
    }
  };

  const checkUserReview = (reviewsData = []) => {
    try {
      // Get user email from localStorage or form
      const userEmail = email || getCurrentUserEmail();
      if (userEmail && reviewsData.length > 0) {
        const userHasReviewed = reviewsData.some(review => 
          review.userEmail === userEmail || review.email === userEmail
        );
        setHasUserReviewed(userHasReviewed);
      }
    } catch (error) {
      console.error('Error checking user review:', error);
    }
  };

  const getCurrentUserEmail = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return user.email || user.userEmail || '';
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
    return '';
  };

  const handleSubmitReview = async () => {
    // Validate form data
    const reviewData = {
      productId: parseInt(productId),
      userName: name.trim(),
      userEmail: email.trim(),
      userPhone: phone.trim(),
      rating: rating,
      comment: message.trim(),
    };

    const validationErrors = reviewUtils.validateReviewData(reviewData);
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    try {
      setReviewLoading(true);
      setError('');
      setSuccess('');

      console.log('📤 Submitting review:', reviewData);
      const response = await reviewAPI.addReview(reviewData);
      console.log('✅ Review submission response:', response);

      if (response.success) {
        setSuccess('Review submitted successfully!');
        // Reset form
        setRating(0);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        setHasUserReviewed(true);
        
        // Refresh reviews list
        await fetchReviews();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Format date using the utility function
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    return reviewUtils.formatReviewDate(dateString);
  };

  // Get rating distribution for display
  const getRatingDistribution = () => {
    return reviewUtils.getRatingDistribution(reviews);
  };

  // Render star rating display
  const renderStarRating = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
            <Star filled={star <= rating} />
          </span>
        ))}
      </div>
    );
  };

  // Get user initial for avatar
  const getUserInitial = (userName) => {
    return userName?.charAt(0)?.toUpperCase() || "U";
  };

  if (loading) {
    return (
      <div className="review-wrapper w-full flex justify-center items-center py-10">
        <LoaderStyleOne />
        <span className="ml-2 text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  return (
    <div className="review-wrapper w-full">
      {/* Debug info - remove in production */}
      {import.meta.env.DEV && (
        <div className="bg-blue-50 p-3 rounded-lg mb-4 text-xs">
          <strong>Debug Info:</strong> {reviews.length} reviews loaded, 
          Average: {averageRating}, Total: {totalReviews}
        </div>
      )}

      {/* Review Summary Section */}
      <div className="summary-section bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-6 mb-4 md:mb-0">
            <div className="text-center">
              <div className="text-4xl font-bold text-qblack">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center mt-1">
                {renderStarRating(Math.round(averageRating))}
              </div>
              <p className="text-qgray text-sm mt-1">{totalReviews} reviews</p>
            </div>
            
            {/* Rating Distribution */}
            {reviews.length > 0 && (
              <div className="hidden md:block">
                {[5, 4, 3, 2, 1].map((star) => {
                  const distribution = getRatingDistribution();
                  const count = distribution[star] || 0;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  
                  return (
                    <div key={star} className="flex items-center space-x-2 text-sm mb-1">
                      <span className="w-4 text-right">{star}</span>
                      <Star filled={true} className="w-4 h-4" />
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-left">({count})</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-qblack font-medium text-lg">Share Your Experience</p>
            <p className="text-qgray text-sm">Help other customers make informed decisions</p>
          </div>
        </div>
      </div>

      <div className="w-full reviews mb-[60px]">
        {/* Messages */}
        {(error || success) && (
          <div className={`p-4 rounded-lg mb-6 ${
            error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                {error ? '❌' : '✅'} {error || success}
              </span>
              <button 
                onClick={clearMessages} 
                className="text-lg font-bold hover:opacity-70 transition-opacity"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="w-full comments mb-[60px]">
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div
                  key={review.id || review._id || `review-${index}`}
                  className="comment-item bg-white px-6 py-6 rounded-lg shadow-sm border border-qgray-border hover:shadow-md transition-shadow"
                >
                  <div className="comment-author flex justify-between items-center mb-4">
                    <div className="flex space-x-3 items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-lg font-medium text-white">
                          {getUserInitial(review.userName || review.name)}
                        </span>
                      </div>
                      <div>
                        <p className="text-[16px] font-medium text-qblack">
                          {review.userName || review.name || "Anonymous"}
                        </p>
                        <p className="text-[13px] font-normal text-qgray">
                          {formatDate(review.createdAt || review.date || review.timestamp)}
                          {review.verifiedPurchase && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStarRating(review.rating)}
                      <span className="text-[13px] font-normal text-qblack mt-1 inline-block">
                        ({review.rating}.0)
                      </span>
                    </div>
                  </div>
                  <div className="comment">
                    <p className="text-[15px] text-qgray leading-7 text-normal whitespace-pre-wrap">
                      {review.comment || review.message || review.reviewText}
                    </p>
                  </div>
                  {review.updatedAt && review.updatedAt !== review.createdAt && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-qgray italic">
                        Updated {formatDate(review.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-qgray text-lg mb-2">No reviews yet</p>
              <p className="text-qgray text-sm">Be the first to share your thoughts about this product!</p>
            </div>
          )}
        </div>
        
        {/* Review Form - Only show if user hasn't reviewed yet */}
        {!hasUserReviewed && (
          <div className="write-review w-full bg-white p-8 rounded-lg shadow-sm border border-qgray-border">
            <h2 className="text-2xl font-semibold text-qblack mb-2">
              Write Your Review
            </h2>
            <p className="text-qgray text-sm mb-6">
              Share your experience with this product
            </p>

            {/* Rating Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-qgray mb-3">
                Your Rating *
              </label>
              <div className="flex space-x-1 items-center">
                <StarRating
                  hoverRating={hoverRating}
                  hoverHandler={setHoverRating}
                  rating={rating}
                  ratingHandler={setRating}
                />
                <span className="text-qblack text-[15px] font-normal ml-2">
                  {rating > 0 ? `(${rating}.0)` : '(Select rating)'}
                </span>
              </div>
              {rating === 0 && (
                <p className="text-red-500 text-xs mt-1">Please select a rating</p>
              )}
            </div>

            {/* Review Form */}
            <div className="w-full review-form">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <InputCom
                    label="Name *"
                    placeholder="Your full name"
                    type="text"
                    name="name"
                    inputClasses="h-[50px]"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={true}
                  />
                </div>
                <div>
                  <InputCom
                    label="Email *"
                    placeholder="your.email@example.com"
                    type="email"
                    name="email"
                    inputClasses="h-[50px]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={true}
                  />
                </div>
                <div>
                  <InputCom
                    label="Phone (optional)"
                    placeholder="Your phone number"
                    type="tel"
                    name="phone"
                    inputClasses="h-[50px]"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full mb-6">
                <label className="block text-sm font-medium text-qgray mb-3">
                  Your Review *
                  <span className="text-xs text-qgray ml-2">
                    (Minimum 10 characters)
                  </span>
                </label>
                <textarea
                  className="w-full h-[150px] p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none border border-qgray-border rounded-lg resize-none transition-all"
                  placeholder="Share your honest experience with this product. What did you like? What could be improved?..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  minLength="10"
                  maxLength="1000"
                ></textarea>
                <div className="flex justify-between text-sm text-qgray mt-1">
                  <span className={message.length < 10 ? 'text-red-500' : ''}>
                    {message.length}/1000 characters
                    {message.length > 0 && message.length < 10 && ' - Minimum 10 characters required'}
                  </span>
                  <span>{1000 - message.length} characters left</span>
                </div>
              </div>
              
              <button
                onClick={handleSubmitReview}
                type="button"
                disabled={reviewLoading || rating === 0 || message.length < 10 || !name.trim() || !email.trim()}
                className="black-btn w-full md:w-[300px] h-[50px] font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {reviewLoading ? (
                  <div className="flex items-center justify-center">
                    <LoaderStyleOne />
                    <span className="ml-2">Submitting...</span>
                  </div>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
              
              <p className="text-xs text-qgray mt-3">
                By submitting your review, you agree to our terms of service and privacy policy.
              </p>
            </div>
          </div>
        )}

        {/* Message if user has already reviewed */}
        {hasUserReviewed && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-lg font-medium text-blue-800 mb-2">Thank You for Your Review!</h3>
            <p className="text-blue-600">
              You've already submitted a review for this product. 
              {reviews.some(r => r.userEmail === email || r.email === email) && ' Your review is visible above.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}