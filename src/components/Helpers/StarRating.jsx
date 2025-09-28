// src/Helpers/StarRating.jsx
import { useState, useEffect } from 'react';

const StarRating = ({ 
  rating, 
  ratingHandler, 
  hoverRating, 
  hoverHandler,
  size = "md",
  disabled = false,
  showLabel = false,
  interactive = true
}) => {
  const [currentHover, setCurrentHover] = useState(hoverRating || 0);
  
  // Sync with parent component's hover state
  useEffect(() => {
    setCurrentHover(hoverRating || 0);
  }, [hoverRating]);

  const handleMouseEnter = (index) => {
    if (!interactive || disabled) return;
    setCurrentHover(index);
    if (hoverHandler) hoverHandler(index);
  };

  const handleMouseLeave = () => {
    if (!interactive || disabled) return;
    setCurrentHover(0);
    if (hoverHandler) hoverHandler(rating);
  };

  const handleClick = (index) => {
    if (!interactive || disabled) return;
    if (ratingHandler) ratingHandler(index);
  };

  // Size configurations
  const sizeConfig = {
    sm: { width: 16, height: 15, className: "w-4 h-4" },
    md: { width: 19, height: 18, className: "w-5 h-5" },
    lg: { width: 24, height: 23, className: "w-6 h-6" },
    xl: { width: 32, height: 30, className: "w-8 h-8" }
  };

  const { width, height, className } = sizeConfig[size];

  // Rating labels
  const ratingLabels = {
    1: "Poor",
    2: "Fair", 
    3: "Good",
    4: "Very Good",
    5: "Excellent"
  };

  return (
    <div className="star-rating-component">
      <div className={`star-rating flex items-center space-x-1 ${disabled ? 'opacity-60' : ''}`}>
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= (currentHover || rating);
          
          return (
            <button
              type="button"
              key={starValue}
              className={`transition-all duration-200 ${
                interactive && !disabled ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              } ${isFilled ? "text-qyellow" : "text-gray-300"}`}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={disabled || !interactive}
              aria-label={`Rate ${starValue} out of 5 stars`}
              title={ratingLabels[starValue]}
            >
              <svg
                width={width}
                height={height}
                viewBox="0 0 19 18"
                fill="currentColor"
                className={className}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z" />
              </svg>
            </button>
          );
        })}
        
        {/* Display current rating label */}
        {showLabel && rating > 0 && (
          <span className="ml-2 text-sm font-medium text-qblack">
            {ratingLabels[rating]}
          </span>
        )}
      </div>
      
      {/* Accessibility: Hidden description for screen readers */}
      <div className="sr-only">
        {rating > 0 
          ? `Rated ${rating} out of 5 stars. ${ratingLabels[rating]}.`
          : "No rating selected."
        }
        {interactive && !disabled && " Click to select a rating."}
      </div>
    </div>
  );
};

// Default props for better reliability
StarRating.defaultProps = {
  rating: 0,
  hoverRating: 0,
  size: "md",
  disabled: false,
  showLabel: false,
  interactive: true
};

export default StarRating;