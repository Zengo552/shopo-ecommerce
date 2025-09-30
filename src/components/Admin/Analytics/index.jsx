// components/Admin/Analytics/index.jsx
import React, { useState, useEffect } from 'react';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    salesData: [],
    trafficData: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockAnalytics = {
      salesData: [
        { month: 'Jan', sales: 12000 },
        { month: 'Feb', sales: 19000 },
        { month: 'Mar', sales: 15000 },
        { month: 'Apr', sales: 22000 },
        { month: 'May', sales: 18000 },
        { month: 'Jun', sales: 25000 },
      ],
      trafficData: [
        { source: 'Direct', visitors: 1200 },
        { source: 'Google', visitors: 800 },
        { source: 'Social Media', visitors: 600 },
        { source: 'Email', visitors: 400 },
      ],
      topProducts: [
        { name: 'Product A', sales: 150 },
        { name: 'Product B', sales: 120 },
        { name: 'Product C', sales: 95 },
        { name: 'Product D', sales: 80 },
      ]
    };
    
    setAnalytics(mockAnalytics);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="admin-card">Loading analytics...</div>;
  }

  return (
    <div>
      <h2>Business Analytics</h2>
      
      <div className="grid-2">
        <div className="admin-card">
          <h3>Sales Overview</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'end', gap: '1rem', justifyContent: 'center' }}>
            {analytics.salesData.map((item, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div 
                  style={{
                    height: `${(item.sales / 25000) * 200}px`,
                    width: '40px',
                    background: '#3498db',
                    borderRadius: '4px 4px 0 0'
                  }}
                />
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  {item.month}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#7f8c8d' }}>
                  ${(item.sales / 1000).toFixed(0)}k
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h3>Traffic Sources</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {analytics.trafficData.map((item, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>{item.source}</span>
                  <span>{item.visitors} visitors</span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#ecf0f1',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{
                      height: '100%',
                      background: '#e74c3c',
                      width: `${(item.visitors / 1200) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3>Top Products</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Sales</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {analytics.topProducts.map((product, index) => (
              <tr key={index}>
                <td>{product.name}</td>
                <td>{product.sales} units</td>
                <td>
                  <div style={{
                    height: '8px',
                    background: '#ecf0f1',
                    borderRadius: '4px',
                    width: '100px',
                    overflow: 'hidden'
                  }}>
                    <div 
                      style={{
                        height: '100%',
                        background: '#27ae60',
                        width: `${(product.sales / 150) * 100}%`
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAnalytics;