// components/Admin/Dashboard/index.jsx
import React, { useState, useEffect } from "react";
import LayoutHomeTwo from "../../Partials/LayoutHomeTwo";
import SectionStyleFour from "../../Helpers/SectionStyleFour";
import SectionStyleThreeHomeTwo from "../../Helpers/SectionStyleThreeHomeTwo";
import SectionStyleTwo from "../../Helpers/SectionStyleTwoHomeTwo";
import ViewMoreTitle from "../../Helpers/ViewMoreTitle";
import ProductsAds from "../../Home/ProductsAds";
import Banner from "./Banner";
import CampaignCountDown from "./CampaignCountDown";
import CategoriesSection from "../Categories/CategoriesSection";
import { productAPI, orderAPI, userAPI, shopAPI } from "../../../services/api";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalProducts: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalSellers: 0,
      revenue: 0,
      pendingOrders: 0
    },
    recentProducts: [],
    recentOrders: [],
    topSelling: [],
    loading: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes, shopsRes] = await Promise.all([
        productAPI.getAll({}, { page: 1, limit: 10 }),
        orderAPI.getUserOrders(),
        shopAPI.getAllShops()
      ]);

      // Mock data - replace with actual API responses
      const mockStats = {
        totalProducts: productsRes.total || 156,
        totalOrders: ordersRes.length || 89,
        totalUsers: 243,
        totalSellers: shopsRes.length || 34,
        revenue: 25430,
        pendingOrders: 12
      };

      const mockRecentProducts = (productsRes.products || productsRes.data || []).slice(0, 6);
      const mockRecentOrders = ordersRes.slice(0, 5) || [];
      const mockTopSelling = (productsRes.products || productsRes.data || []).slice(0, 8);

      setDashboardData({
        stats: mockStats,
        recentProducts: mockRecentProducts,
        recentOrders: mockRecentOrders,
        topSelling: mockTopSelling,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  if (dashboardData.loading) {
    return (
      <LayoutHomeTwo>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading Dashboard...</div>
        </div>
      </LayoutHomeTwo>
    );
  }

  return (
    <LayoutHomeTwo>
      {/* Admin Dashboard Banner */}
      <Banner 
        className="banner-wrapper mb-[46px]" 
        stats={dashboardData.stats}
      />
      
      {/* Quick Stats Categories */}
      <ViewMoreTitle
        className="my-categories mb-[60px]"
        seeMoreUrl="/admin/analytics"
        categoryTitle="Business Overview"
      >
        <CategoriesSection stats={dashboardData.stats} />
      </ViewMoreTitle>

      {/* Recent Products */}
      <SectionStyleThreeHomeTwo
        products={dashboardData.recentProducts}
        showProducts={6}
        sectionTitle="Recent Products"
        seeMoreUrl="/admin/products"
        className="new-products mb-[60px]"
        adminMode={true}
      />

      {/* Pending Orders Countdown */}
      <CampaignCountDown 
        className="mb-[60px]" 
        pendingOrders={dashboardData.stats.pendingOrders}
      />

      {/* Quick Actions Ads */}
      <ProductsAds
        ads={[
          `${import.meta.env.VITE_PUBLIC_URL}/assets/images/admin-action-1.png`,
          `${import.meta.env.VITE_PUBLIC_URL}/assets/images/admin-action-2.png`,
        ]}
        sectionHeight="sm:h-[290px] h-full"
        className="products-ads-section mb-[60px]"
        adminActions={true}
      />

      {/* Recent Orders */}
      <SectionStyleThreeHomeTwo
        products={dashboardData.recentOrders.map(order => ({
          id: order.id,
          name: `Order #${order.id}`,
          price: order.totalAmount,
          image: `${import.meta.env.VITE_PUBLIC_URL}/assets/images/order-icon.png`,
          status: order.status,
          date: order.createdAt
        }))}
        showProducts={3}
        sectionTitle="Recent Orders"
        seeMoreUrl="/admin/orders"
        className="feature-products mb-[60px]"
        adminMode={true}
        isOrders={true}
      />

      {/* Top Selling Products */}
      <ViewMoreTitle
        className="top-selling-product mb-[60px]"
        seeMoreUrl="/admin/products"
        categoryTitle="Top Selling Products"
      >
        <SectionStyleTwo 
          products={dashboardData.topSelling} 
          adminMode={true}
        />
      </ViewMoreTitle>

      {/* System Status Ad */}
      <ProductsAds
        ads={[`${import.meta.env.VITE_PUBLIC_URL}/assets/images/system-status.png`]}
        className="products-ads-section mb-[60px]"
        systemStatus={true}
      />

      {/* User Management Preview */}
      <SectionStyleThreeHomeTwo
        products={[
          {
            id: 1,
            name: "Active Users",
            price: dashboardData.stats.totalUsers,
            image: `${import.meta.env.VITE_PUBLIC_URL}/assets/images/users-icon.png`,
            role: "Users"
          },
          {
            id: 2,
            name: "Sellers",
            price: dashboardData.stats.totalSellers,
            image: `${import.meta.env.VITE_PUBLIC_URL}/assets/images/sellers-icon.png`,
            role: "Sellers"
          }
        ]}
        showProducts={2}
        sectionTitle="User Management"
        seeMoreUrl="/admin/users"
        className="new-arrivals mb-[60px]"
        adminMode={true}
        isUsers={true}
      />

      {/* Analytics Quick View */}
      <ProductsAds
        sectionHeight="164"
        ads={[`${import.meta.env.VITE_PUBLIC_URL}/assets/images/analytics-quick.png`]}
        className="products-ads-section mb-[60px]"
        analyticsPreview={true}
        revenue={dashboardData.stats.revenue}
      />

      {/* Category Performance */}
      <SectionStyleFour
        products={dashboardData.topSelling}
        sectionTitle="Category Performance"
        seeMoreUrl="/admin/categories"
        className="category-products mb-[60px]"
        adminMode={true}
      />
    </LayoutHomeTwo>
  );
}