// components/Admin/Dashboard/CategoriesSection.jsx
import React from "react";

export default function CategoriesSection({ stats }) {
  const statCards = [
    {
      id: 1,
      title: "Products",
      value: stats.totalProducts,
      icon: "🛍️",
      color: "from-blue-500 to-blue-600",
      url: "/admin/products"
    },
    {
      id: 2,
      title: "Orders",
      value: stats.totalOrders,
      icon: "📦",
      color: "from-green-500 to-green-600",
      url: "/admin/orders"
    },
    {
      id: 3,
      title: "Users",
      value: stats.totalUsers,
      icon: "👥",
      color: "from-purple-500 to-purple-600",
      url: "/admin/users"
    },
    {
      id: 4,
      title: "Sellers",
      value: stats.totalSellers,
      icon: "🏪",
      color: "from-orange-500 to-orange-600",
      url: "/admin/sellers"
    },
    {
      id: 5,
      title: "Revenue",
      value: `$${(stats.revenue / 1000).toFixed(1)}K`,
      icon: "💰",
      color: "from-teal-500 to-teal-600",
      url: "/admin/analytics"
    },
    {
      id: 6,
      title: "Pending",
      value: stats.pendingOrders,
      icon: "⏳",
      color: "from-red-500 to-red-600",
      url: "/admin/orders"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => (
        <a
          key={stat.id}
          href={stat.url}
          className="block group"
        >
          <div className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white text-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm opacity-90">{stat.title}</div>
          </div>
        </a>
      ))}
    </div>
  );
}