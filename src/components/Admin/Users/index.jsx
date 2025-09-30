// components/Admin/Users/index.jsx
import React, { useState, useEffect } from 'react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'customer', status: 'active', createdAt: '2024-01-15' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'customer', status: 'active', createdAt: '2024-01-14' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'customer', status: 'inactive', createdAt: '2024-01-13' },
    ];
    
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  if (loading) {
    return <div className="admin-card">Loading users...</div>;
  }

  return (
    <div className="admin-card">
      <h2>Users Management</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  backgroundColor: user.role === 'admin' ? '#3498db' : '#95a5a6',
                  color: 'white'
                }}>
                  {user.role}
                </span>
              </td>
              <td>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  backgroundColor: user.status === 'active' ? '#27ae60' : '#e74c3c',
                  color: 'white'
                }}>
                  {user.status}
                </span>
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => toggleUserStatus(user.id)}
                    className={`btn ${user.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  >
                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;