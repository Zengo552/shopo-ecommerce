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

// Enhanced Error Boundary Component
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
    
    // Log auth state for debugging
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    console.error("💥 Application Error:", {
      error: error.message,
      componentStack: errorInfo.componentStack,
      authState: {
        hasToken: !!authToken,
        hasUserData: !!userData,
        userRole: userData ? JSON.parse(userData).role : 'none'
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">We're sorry for the inconvenience. Please try refreshing the page.</p>
            
            {/* Debug info */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Debug Information:</strong>
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Auth Token: {localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing'}</div>
                <div>User Data: {localStorage.getItem('userData') ? '✅ Present' : '❌ Missing'}</div>
                <div>Path: {window.location.pathname}</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => {
                  // Clear potentially corrupted auth data
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('userData');
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Clear Data & Refresh
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Refresh Page
              </button>
            </div>

            {import.meta.env.DEV && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-purple-600 font-medium">Error Details (Development)</summary>
                <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-auto max-h-40">
                  {this.state.error && this.state.error.toString()}
                  {"\n\n"}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Root component
function RootComponent() {
  React.useEffect(() => {
    console.log('✅ Root component mounted');
    
    // Log initial auth state
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    console.log('🔐 Initial auth state:', { 
      hasToken: !!token, 
      userData: userData ? JSON.parse(userData) : null,
      environment: import.meta.env.MODE
    });
    
    // Listen for auth changes across tabs
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'userData') {
        console.log('🔄 Cross-tab storage change:', e.key);
        window.dispatchEvent(new Event('authStateChange'));
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

// Service Worker Registration
if (import.meta.env.MODE === "production") {
  registerSW();
  console.log('🏭 Production mode enabled');
} else {
  console.log('🔧 Development mode enabled');
}

// Initialize animations
AOS.init({
  duration: 800,
  once: true,
  offset: 100,
});

console.log('🎯 Starting ReactDOM render...');

// Render application
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
      <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Application Error</h1>
          <p class="text-gray-600 mb-4">Failed to load the application. Please refresh the page.</p>
          <button onclick="window.location.reload()" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
            Refresh Page
          </button>
          <div class="mt-4 text-sm text-gray-500">
            Error: ${renderError.message}
          </div>
        </div>
      </div>
    `;
  }
}

console.log('🎊 Application initialization complete');