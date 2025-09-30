// components/Admin/Dashboard/CampaignCountDown.jsx
import React from "react";

export default function CampaignCountDown({ className, pendingOrders }) {
  return (
    <div className={`${className}`}>
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h3 className="text-2xl font-bold mb-2">Attention Required</h3>
            <p className="text-lg opacity-90">
              You have {pendingOrders} orders pending review
            </p>
          </div>
          <div className="flex gap-4 text-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <div className="text-sm">Pending</div>
            </div>
            <a 
              href="/admin/orders" 
              className="bg-white text-orange-600 px-6 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
            >
              Review Orders
              <span className="ml-2">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}