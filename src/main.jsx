// src/main.jsx
import React from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import Routers from "./Routers";
import "./index.css";
import 'react-range-slider-input/dist/style.css';
import { registerSW } from "virtual:pwa-register";
import { AuthProvider } from "./contexts/AuthProvider";
import { CartProvider } from "./contexts/CartProvider";
import { FavoriteProvider } from "./contexts/FavoriteProvider";
import ToastNotifications from "./components/ToastNotifications";

// Debug logging for provider initialization
console.log('🚀 Initializing application...');

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    console.error('❌ Error caught by boundary:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Error details:", error, errorInfo);
    
    // Log additional context info
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    console.log('Auth state at error:', { 
      hasToken: !!authToken, 
      hasUserData: !!userData,
      tokenLength: authToken ? authToken.length : 0
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1>Something went wrong.</h1>
          <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
          
          {/* Additional debug info */}
          <div style={{ margin: '1rem 0', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              <strong>Debug Info:</strong><br />
              Auth Token: {localStorage.getItem('authToken') ? 'Present' : 'Missing'}<br />
              User Data: {localStorage.getItem('userData') ? 'Present' : 'Missing'}
            </p>
          </div>
          
          <button 
            onClick={() => {
              // Clear potentially corrupted auth data
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
              window.location.reload();
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              margin: '0.5rem'
            }}
          >
            Clear Data & Refresh
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              margin: '0.5rem'
            }}
          >
            Refresh Page
          </button>
          
          {import.meta.env.DEV && (
            <details style={{ marginTop: '1rem', textAlign: 'left' }}>
              <summary>Error Details (Development Only)</summary>
              <pre style={{ 
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '4px',
                overflowX: 'auto',
                fontSize: '0.8rem'
              }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced root component with debugging
function RootComponent() {
  React.useEffect(() => {
    console.log('✅ Root component mounted');
    
    // Log initial auth state
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    console.log('🔐 Initial auth state:', { 
      hasToken: !!token, 
      userData: userData ? JSON.parse(userData) : null 
    });
    
    // Listen for auth changes
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'userData') {
        console.log('🔄 Storage changed:', e.key, e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <FavoriteProvider>
            <Routers />
            <ToastNotifications />
          </FavoriteProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

if (import.meta.env.MODE === "production") {
  registerSW();
  console.log('🏭 Production mode enabled');
} else {
  console.log('🔧 Development mode enabled');
}

// Initialize AOS with better configuration
AOS.init({
  duration: 800,
  once: true,
  offset: 100,
});

console.log('🎯 Starting ReactDOM render...');

// Render with error handling
try {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  
  root.render(
    <React.StrictMode>
      <RootComponent />
    </React.StrictMode>
  );
  
  console.log('✅ React application rendered successfully');
} catch (renderError) {
  console.error('💥 Failed to render React app:', renderError);
  
  // Fallback rendering
  const fallbackElement = document.getElementById("root");
  if (fallbackElement) {
    fallbackElement.innerHTML = `
      <div style="padding: 2rem; text-align: center; font-family: sans-serif;">
        <h1>Application Error</h1>
        <p>Failed to load the application. Please refresh the page.</p>
        <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Refresh Page
        </button>
        <div style="margin-top: 1rem; color: #666; font-size: 0.9rem;">
          Error: ${renderError.message}
        </div>
      </div>
    `;
  }
}

console.log('🎊 Application initialization complete');