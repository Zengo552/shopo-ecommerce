// src/pages/Reviews.jsx
import Star from "../Helpers/icons/Star";
import InputCom from "../Helpers/InputCom";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import StarRating from "../Helpers/StarRating";

export default function Reviews({
  reviews,
  rating,
  ratingHandler,
  name,
  nameHandler,
  email,
  emailHandler,
  phone,
  phoneHandler,
  message,
  messageHandler,
  reviewAction,
  hoverRating,
  hoverHandler,
  reviewLoading,
}) {
  return (
    <div className="review-wrapper w-full">
      <div className="w-full reviews mb-[60px]">
        {/* comments */}
        <div className="w-full comments mb-[60px]">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <div
                key={review.id}
                className="comment-item bg-white px-10 py-[32px] mb-2.5"
              >
                <div className="comment-author flex justify-between items-center mb-3">
                  <div className="flex space-x-3 items-center">
                    <div className="w-[50px] h-[50px] rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      <span className="text-lg font-medium">
                        {review.userName?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="text-[18px] font-medium text-qblack">
                        {review.userName || "Anonymous"}
                      </p>
                      <p className="text-[13px] font-normal text-qgray">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {Array.from({ length: Math.floor(review.rating) }, (_, i) => (
                        <span key={i}>
                          <Star />
                        </span>
                      ))}
                    </div>
                    <span className="text-[13px] font-normal text-qblack mt-1 inline-block">
                      ({review.rating}.0)
                    </span>
                  </div>
                </div>
                <div className="comment mb-[30px]">
                  <p className="text-[15px] text-qgray leading-7 text-normal">
                    {review.comment}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-qgray py-10">No reviews yet. Be the first to review!</p>
          )}
        </div>
        
        {/* Review form */}
        <div className="write-review w-full">
          <h1 className="text-2xl font-medium text-qblack mb-5">
            Write Your Review
          </h1>

          <div className="flex space-x-1 items-center mb-[30px]">
            <StarRating
              hoverRating={hoverRating}
              hoverHandler={hoverHandler}
              rating={rating}
              ratingHandler={ratingHandler}
            />
            <span className="text-qblack text-[15px] font-normal mt-1">
              ({rating}.0)
            </span>
          </div>

          <div className="w-full review-form ">
            <div className="sm:flex sm:space-x-[30px] items-center mb-5">
              <div className="sm:w-1/3 w-full">
                <InputCom
                  label="Name*"
                  placeholder="Your name"
                  type="text"
                  name="name"
                  inputClasses="h-[50px]"
                  value={name}
                  inputHandler={nameHandler}
                />
              </div>
              <div className="sm:w-1/3 w-full mt-5 sm:mt-0">
                <InputCom
                  label="Email*"
                  placeholder="Your Email"
                  type="email"
                  name="email"
                  inputClasses="h-[50px]"
                  value={email}
                  inputHandler={emailHandler}
                />
              </div>
              <div className="sm:w-1/3 w-full mt-5 sm:mt-0">
                <InputCom
                  label="Phone (optional)"
                  placeholder="Your Phone"
                  type="text"
                  name="phone"
                  inputClasses="h-[50px]"
                  value={phone}
                  inputHandler={phoneHandler}
                />
              </div>
            </div>
            <div className="w-full mb-[30px]">
              <h6 className="input-label text-qgray text-[13px] font-medium block mb-2">
                Message*
              </h6>
              <textarea
                className="w-full h-[150px] p-3 focus:ring-0 focus:outline-none border border-qgray-border"
                placeholder="Write your review here..."
                value={message}
                onChange={(e) => messageHandler(e.target.value)}
              ></textarea>
            </div>
            <button
              onClick={reviewAction}
              type="button"
              disabled={reviewLoading}
              className="black-btn w-[300px] h-[50px] font-medium text-sm"
            >
              {reviewLoading ? (
                <LoaderStyleOne />
              ) : (
                <span>Submit Review</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}