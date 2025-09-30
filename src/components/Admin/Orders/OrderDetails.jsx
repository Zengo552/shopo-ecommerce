// components/Admin/Orders/OrderDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getOrderById(id);
      setOrder(response);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-card">Loading order details...</div>;
  }

  if (!order) {
    return <div className="admin-card">Order not found</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/admin/orders')}
        >
          ← Back to Orders
        </button>
        <h2>Order Details - #{order.id}</h2>
      </div>

      <div className="grid-2">
        <div className="admin-card">
          <h3>Order Information</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <strong>Order ID:</strong> #{order.id}
            </div>
            <div>
              <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
            </div>
            <div>
              <strong>Status:</strong> 
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                marginLeft: '0.5rem',
                backgroundColor: 
                  order.status === 'delivered' ? '#d4edda' :
                  order.status === 'shipped' ? '#d1ecf1' :
                  order.status === 'pending' ? '#fff3cd' : '#f8d7da',
                color: 
                  order.status === 'delivered' ? '#155724' :
                  order.status === 'shipped' ? '#0c5460' :
                  order.status === 'pending' ? '#856404' : '#721c24'
              }}>
                {order.status}
              </span>
            </div>
            <div>
              <strong>Total Amount:</strong> ${order.totalAmount}
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h3>Customer Information</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <strong>Name:</strong> {order.customerName || 'N/A'}
            </div>
            <div>
              <strong>Email:</strong> {order.customerEmail || 'N/A'}
            </div>
            <div>
              <strong>Phone:</strong> {order.customerPhone || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3>Order Items</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, index) => (
              <tr key={index}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    )}
                    {item.name}
                  </div>
                </td>
                <td>${item.price}</td>
                <td>{item.quantity}</td>
                <td>${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-card">
        <h3>Shipping Address</h3>
        <p>{order.shippingAddress || 'No shipping address provided'}</p>
      </div>
    </div>
  );
};

export default OrderDetails;