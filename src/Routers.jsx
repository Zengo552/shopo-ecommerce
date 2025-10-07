import { createBrowserRouter, RouterProvider } from "react-router-dom";
import About from "./components/About/index.jsx";
import AllProductPage from "./components/AllProductPage/index.jsx";
import Login from "./components/Auth/Login/index.jsx";
import Profile from "./components/Auth/Profile/index.jsx";
import Signup from "./components/Auth/Signup/index.jsx";
import VerifyEmail from "./components/Auth/VerifyEmail/index.jsx";
import ForgotPassword from "./components/Auth/ForgotPassword/index.jsx";
import ResetPassword from "./components/Auth/ResetPassword/index.jsx";
import BecomeSaller from "./components/BecomeSaller/index.jsx";
import Blogs from "./components/Blogs/index.jsx";
import Blog from "./components/Blogs/Blog.jsx";
import CardPage from "./components/CartPage/index.jsx";
import CheakoutPage from "./components/CheakoutPage/index.jsx";
import Contact from "./components/Contact/index.jsx";
import Faq from "./components/Faq/index.jsx";
import FlashSale from "./components/FlashSale/index.jsx";
import FourZeroFour from "./components/FourZeroFour/index.jsx";
import Home from "./components/Home/index.jsx";
import HomeTwo from "./components/HomeTwo/index.jsx";
import PrivacyPolicy from "./components/PrivacyPolicy/index.jsx";
import ProductsCompaire from "./components/ProductsCompaire/index.jsx";
import SallerPage from "./components/SallerPage/index.jsx";
import Sallers from "./components/Sellers/index.jsx";
import SingleProductPage from "./components/SingleProductPage/index.jsx";
import TermsCondition from "./components/TermsCondition/index.jsx";
import TrackingOrder from "./components/TrackingOrder/index.jsx";
import Wishlist from "./components/Wishlist/index.jsx";
import HomeThree from "./components/HomeThree/index.jsx";
import HomeFour from "./components/HomeFour/index.jsx";
import HomeFive from "./components/HomeFive/index.jsx";

// Admin Panel Components
import AdminDashboard from "./components/Admin/Dashboard/index.jsx";
import AdminProducts from "./components/Admin/Products/index.jsx";
import AdminAddProduct from "./components/Admin/Products/AddProduct.jsx";
import AdminEditProduct from "./components/Admin/Products/EditProduct.jsx";
import AdminCategories from "./components/Admin/Categories/index.jsx";
import AdminOrders from "./components/Admin/Orders/index.jsx";
import AdminOrderDetails from "./components/Admin/Orders/OrderDetails.jsx";
import AdminUsers from "./components/Admin/Users/index.jsx";
import AdminSellers from "./components/Admin/Sellers/index.jsx";
import AdminSettings from "./components/Admin/Settings/index.jsx";
import AdminAnalytics from "./components/Admin/Analytics/index.jsx";

// Authentication Components
import PrivateRoute from "./components/Admin/PrivateRoute.jsx";

const router = createBrowserRouter([
  { 
    path: "/", 
    element: <Home /> 
  },
  { 
    path: "/home-two", 
    element: <HomeTwo /> 
  },
  { 
    path: "/home-three", 
    element: <HomeThree /> 
  },
  { 
    path: "/home-four", 
    element: <HomeFour /> 
  },
  { 
    path: "/home-five", 
    element: <HomeFive /> 
  },
  { 
    path: "/all-products", 
    element: <AllProductPage /> 
  },
  { 
    path: "/single-product/:id", 
    element: <SingleProductPage /> 
  },
  { 
    path: "/cart", 
    element: <CardPage /> 
  },
  { 
    path: "/checkout", 
    element: <CheakoutPage /> 
  },
  { 
    path: "/wishlist", 
    element: <Wishlist /> 
  },
  { 
    path: "/flash-sale", 
    element: <FlashSale /> 
  },
  { 
    path: "/saller-page/:id?", 
    element: <SallerPage /> 
  },
  { 
    path: "/products-compaire", 
    element: <ProductsCompaire /> 
  },
  { 
    path: "/sallers", 
    element: <Sallers /> 
  },
  { 
    path: "/about", 
    element: <About /> 
  },
  { 
    path: "/blogs", 
    element: <Blogs /> 
  },
  { 
    path: "/blogs/:id", 
    element: <Blog /> 
  },
  { 
    path: "/tracking-order", 
    element: <TrackingOrder /> 
  },
  { 
    path: "/contact", 
    element: <Contact /> 
  },
  { 
    path: "/faq", 
    element: <Faq /> 
  },
  { 
    path: "/login", 
    element: <Login /> 
  },
  { 
    path: "/signup", 
    element: <Signup /> 
  },
  { 
    path: "/verify-email", 
    element: <VerifyEmail /> 
  },
  { 
    path: "/forgot-password", 
    element: <ForgotPassword /> 
  },
  { 
    path: "/reset-password/:token?", 
    element: <ResetPassword /> 
  },
  { 
    path: "/profile", 
    element: (
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    ) 
  },
  { 
    path: "/become-saller", 
    element: <BecomeSaller /> 
  },
  { 
    path: "/privacy-policy", 
    element: <PrivacyPolicy /> 
  },
  { 
    path: "/terms-condition", 
    element: <TermsCondition /> 
  },
  { 
    path: "/category/:categoryId", 
    element: <AllProductPage /> 
  },
  { 
    path: "/search", 
    element: <AllProductPage /> 
  },
  
  // Admin Panel Routes with Authentication Protection
  {
    path: "/admin",
    element: (
      <PrivateRoute requireAdmin={true}>
        <AdminDashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <PrivateRoute requireAdmin={true}>
        <AdminDashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/products",
    element: (
      <PrivateRoute requireAdmin={true}>
        <AdminProducts />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/products/add",
    element: (
      <PrivateRoute requireAdmin={true}>
        <AdminAddProduct />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/products/edit/:id",
    element: (
      <PrivateRoute requireAdmin={true}>
        <AdminEditProduct />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/categories",
    element: (
      <PrivateRoute requireAdmin={true}>
        <AdminCategories />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/orders",
    element: (
      <PrivateRoute requireAdmin={true}>
        <AdminOrders />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/orders/:id",
    element: (
      <PrivateRoute requireAdmin={true}>
        <AdminOrderDetails />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <PrivateRoute requireAdmin={true}>
        <AdminUsers />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/sellers",
    element: (
      <PrivateRoute requireAdmin={true}>
        <AdminSellers />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/analytics",
    element: (
      <PrivateRoute requireAdmin={true}>
        <AdminAnalytics />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/settings",
    element: (
      <PrivateRoute requireAdmin={true}>
        <AdminSettings />
      </PrivateRoute>
    ),
  },
  
  { 
    path: "*", 
    element: <FourZeroFour /> 
  },
]);

function Routers() {
  return <RouterProvider router={router} />;
}

export default Routers;