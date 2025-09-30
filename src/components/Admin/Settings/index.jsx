// components/Admin/Settings/index.jsx
import React, { useState } from 'react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'My E-commerce Store',
    siteDescription: 'The best online shopping experience',
    currency: 'USD',
    taxRate: 0.08,
    shippingCost: 5.99,
    enableReviews: true,
    requireApproval: false
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings to API
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="admin-card">
      <h2>System Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Site Name</label>
            <input
              type="text"
              name="siteName"
              className="form-control"
              value={settings.siteName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Default Currency</label>
            <select
              name="currency"
              className="form-control"
              value={settings.currency}
              onChange={handleChange}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Site Description</label>
          <textarea
            name="siteDescription"
            className="form-control"
            rows="3"
            value={settings.siteDescription}
            onChange={handleChange}
          />
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Tax Rate (%)</label>
            <input
              type="number"
              name="taxRate"
              className="form-control"
              step="0.01"
              value={settings.taxRate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Shipping Cost ($)</label>
            <input
              type="number"
              name="shippingCost"
              className="form-control"
              step="0.01"
              value={settings.shippingCost}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1.5rem 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="enableReviews"
              checked={settings.enableReviews}
              onChange={handleChange}
            />
            Enable Product Reviews
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="requireApproval"
              checked={settings.requireApproval}
              onChange={handleChange}
            />
            Require Product Approval
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary">
            Save Settings
          </button>
          {saved && (
            <span style={{ color: '#27ae60', fontWeight: '600' }}>
              Settings saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;