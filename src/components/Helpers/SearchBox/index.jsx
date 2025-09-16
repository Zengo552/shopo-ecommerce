import React, { useState, useEffect } from 'react';

export default function SearchBox({ className, type }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const performSearch = async () => {
    if (!searchTerm.trim()) {
      // Optionally clear results or show a message if search term is empty
      setSearchResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null); // Clear previous errors

    try {
      // Construct the URL for your backend search endpoint
      const response = await fetch(`http://localhost:5521/products/search?keyword=${encodeURIComponent(searchTerm)}`);

      if (!response.ok) {
        // Handle HTTP errors (e.g., 404, 500)
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Assuming your backend returns an object with a 'products' array
      if (data.success && data.products) {
        setSearchResults(data.products);
      } else {
        // Handle cases where 'success' is false or 'products' is missing/empty
        setSearchResults([]);
        setError(data.message || 'No products found or an unexpected response was received.');
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message);
      setSearchResults([]); // Clear results on error
    } finally {
      setLoading(false);
    }
  };

  // This function will be called when the search button is clicked
  const handleSearchButtonClick = () => {
    performSearch();
  };

  // You might also want to trigger search on pressing Enter in the input field
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default form submission if it's inside a form
      performSearch();
    }
  };

  // Example of how you might display search results (replace with your actual rendering logic)
  // This would typically be in a parent component or below the search box
  useEffect(() => {
  //   // If you want to auto-search on component mount with a pre-defined term,
  //   // or if searchTerm changes and you want to trigger a search.
  //   // Be careful with infinite loops if searchTerm is updated here.
     if (searchTerm) {
       performSearch();
     }
   }, [searchTerm]); // Dependency array - re-run if searchTerm changes

  return (
    <>
      <div
        className={`w-full h-full flex items-center border border-qgray-border bg-white ${
          className || ""
        }`}
      >
        <div className="flex-1 bg-red-500 h-full"> {/* Consider removing red-500 if not for debugging */}
          <form action="#" className="h-full" onSubmit={(e) => e.preventDefault()}> {/* Prevent default form submission */}
            <input
              type="text"
              className="search-input" // Ensure this class has appropriate styling
              placeholder="Search Product..."
              value={searchTerm}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress} // Add key press handler
            />
          </form>
        </div>
        <div className="w-[1px] h-[22px] bg-qgray-border"></div>
        <div className="flex-1 flex items-center px-4">
          <button
            type="button"
            className="w-full text-xs font-500 text-qgray flex justify-between items-center"
          >
            <span>All Categories</span>
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
        </div>
        <button
          className={` w-[93px] h-full text-sm font-600  ${type===3?'bg-qh3-blue text-white':'search-btn'}`}
          type="button"
          onClick={handleSearchButtonClick} // Add onClick handler
        >
          Search
        </button>
      </div>

      {/* Displaying Search Results (Example) */}
      {loading && <p>Loading search results...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && searchResults.length > 0 && (
        <div>
          <h3>Search Results:</h3>
          <ul>
            {searchResults.map((product) => (
              <li key={product.id}>
                {product.name} - ${product.price} {/* Adjust properties based on your ProductResponseDTO */}
              </li>
            ))}
          </ul>
        </div>
      )}
      {!loading && !error && searchTerm && searchResults.length === 0 && (
        <p>No products found for "{searchTerm}".</p>
      )}
    </>
  );
}