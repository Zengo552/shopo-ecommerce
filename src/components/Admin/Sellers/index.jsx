// components/Admin/Sellers/index.jsx
import React, { useState, useEffect } from 'react';
import { shopAPI } from '../../../services/api';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await shopAPI.getAllShops();
      setSellers(response);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSellerStatus = async (sellerId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      // You'll need to add an update seller status endpoint
      await shopAPI.updateShopStatus(sellerId, newStatus);
      fetchSellers(); // Refresh the list
    } catch (error) {
      console.error('Error updating seller status:', error);
    }
  };

  if (loading) {
    return <div className="admin-card">Loading sellers...</div>;
  }

  return (
    <div className="admin-card">
      <h2>Sellers Management</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Shop ID</th>
            <th>Shop Name</th>
            <th>Owner</th>
            <th>Email</th>
            <th>Products</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map((seller) => (
            <tr key={seller.id}>
              <td>#{seller.id}</td>
              <td>
                <strong>{seller.name}</strong>
              </td>
              <td>{seller.ownerName || 'N/A'}</td>
              <td>{seller.email || 'N/A'}</td>
              <td>{seller.productCount || 0}</td>
              <td>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  backgroundColor: seller.status === 'active' ? '#27ae60' : '#e74c3c',
                  color: 'white'
                }}>
                  {seller.status || 'active'}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => toggleSellerStatus(seller.id, seller.status)}
                    className={`btn ${seller.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  >
                    {seller.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sellers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
          No sellers found
        </div>
      )}
    </div>
  );
};

export default AdminSellers;