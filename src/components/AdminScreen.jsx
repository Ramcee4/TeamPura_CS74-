import React, { useState } from 'react';

export default function AdminScreen({ menuItems, onBackToKiosk, onMenuItemAdded, onMenuItemDeleted }) {
  const [formData, setFormData] = useState({
    name: '',
    chinese_name: '',
    category: 'Dim Sum & Bao',
    price: '',
    description: '',
    image: '',
    tag: 'NEW'
  });
  const [previewImage, setPreviewImage] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);

  const categories = ['Dim Sum & Bao', 'Rice & Wok', 'Quick Bites', 'Drinks & Desserts'];

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      setStatusMsg('Please provide product name and price.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        onMenuItemAdded(data.item);
        setStatusMsg(`✓ "${data.item.name}" successfully added to SQLite!`);
        setFormData({
          name: '',
          chinese_name: '',
          category: 'Dim Sum & Bao',
          price: '',
          description: '',
          image: '',
          tag: 'NEW'
        });
        setPreviewImage('');
      }
    } catch {
      setStatusMsg('Error connecting to backend server.');
    }
    setIsSubmitting(false);
  };

  const confirmDeleteAction = async () => {
    if (!itemToDelete) return;
    try {
      await fetch(`http://localhost:5000/api/menu/${itemToDelete.id}`, { method: 'DELETE' });
      onMenuItemDeleted(itemToDelete.id);
      setStatusMsg(`✓ "${itemToDelete.name}" deleted from SQLite.`);
      setItemToDelete(null);
    } catch {
      setStatusMsg('Failed to delete item from server.');
      setItemToDelete(null);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Admin Top Navigation */}
      <header className="admin-header">
        <div className="admin-brand">
          <span className="logo-text">MING</span>
          <span className="logo-badge">24</span>
          <span className="admin-badge">ADMIN PORTAL</span>
        </div>
        <button 
          id="btn-admin-back" 
          type="button" 
          className="admin-exit-btn" 
          onClick={() => setShowExitModal(true)}
        >
          Exit to Kiosk →
        </button>
      </header>

      {/* Main Admin Workspace */}
      <main className="admin-main-grid">
        <section className="admin-form-card">
          <h2 className="admin-section-title">Add New Product</h2>
          <p className="admin-section-sub">Upload dish photos directly from your computer.</p>

          {statusMsg && <div className="admin-status-alert">{statusMsg}</div>}

          <form onSubmit={handleAddItem} className="admin-add-form">
            <div className="admin-field-row">
              <div className="admin-field">
                <label>PRODUCT NAME (ENGLISH) *</label>
                <input
                  id="input-admin-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="admin-field">
                <label>CHINESE NAME</label>
                <input
                  id="input-admin-chinese-name"
                  type="text"
                  name="chinese_name"
                  value={formData.chinese_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="admin-field-row">
              <div className="admin-field">
                <label>CATEGORY *</label>
                <select
                  id="select-admin-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label>PRICE (₱ PHP) *</label>
                <input
                  id="input-admin-price"
                  type="number"
                  name="price"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="admin-field">
              <label>DESCRIPTION</label>
              <textarea
                id="input-admin-description"
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="admin-field">
              <label>UPLOAD PHOTO FROM YOUR COMPUTER</label>
              <input
                id="input-admin-file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="admin-file-input"
              />
              {previewImage && (
                <div className="upload-preview-box">
                  <img src={previewImage} alt="Preview" className="upload-preview-thumb" />
                  <span>✓ Photo selected and ready to save</span>
                </div>
              )}
            </div>

            <div className="admin-field">
              <label>BADGE / TAG</label>
              <select
                id="select-admin-tag"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
              >
                <option value="">No Badge</option>
                <option value="NEW">NEW</option>
                <option value="BEST SELLER">BEST SELLER</option>
                <option value="POPULAR">POPULAR</option>
                <option value="CHEF PICK">CHEF PICK</option>
              </select>
            </div>

            <button 
              id="btn-admin-submit-item" 
              type="submit" 
              className="admin-submit-btn" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving to SQLite...' : '+ Add Item to Menu'}
            </button>
          </form>
        </section>

        <section className="admin-list-card">
          <div className="admin-list-header">
            <h2 className="admin-section-title">Current Menu Items</h2>
            <span className="items-count-badge">{menuItems.length} Products in SQLite</span>
          </div>

          <div className="admin-items-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-dish-cell">
                        <img src={item.image} alt={item.name} className="table-dish-thumb" />
                        <div>
                          <strong>{item.name}</strong>
                          <span className="table-dish-cn">{item.chinese_name}</span>
                        </div>
                      </div>
                    </td>
                    <td>{item.category}</td>
                    <td><strong>₱{Number(item.price).toFixed(2)}</strong></td>
                    <td>
                      <button
                        id={`btn-admin-delete-${item.id}`}
                        type="button"
                        className="admin-delete-btn"
                        onClick={() => setItemToDelete(item)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Custom Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card">
            <div className="modal-icon-badge warning">🗑️</div>
            <h3 className="custom-modal-title">Delete Product?</h3>
            <p className="custom-modal-sub">
              Are you sure you want to remove <strong>"{itemToDelete.name}"</strong> from SQLite? This cannot be undone.
            </p>
            <div className="modal-actions-row">
              <button
                id="btn-modal-delete-cancel"
                type="button"
                className="modal-secondary-btn"
                onClick={() => setItemToDelete(null)}
              >
                Cancel
              </button>
              <button
                id="btn-modal-delete-confirm"
                type="button"
                className="modal-danger-btn"
                onClick={confirmDeleteAction}
              >
                Yes, Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Admin Exit Confirmation Modal */}
      {showExitModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card">
            <div className="modal-icon-badge warning">🔒</div>
            <h3 className="custom-modal-title">Exit Admin Portal?</h3>
            <p className="custom-modal-sub">
              Are you sure you want to exit and return to the customer kiosk?
            </p>
            <div className="modal-actions-row">
              <button
                id="btn-modal-admin-exit-cancel"
                type="button"
                className="modal-secondary-btn"
                onClick={() => setShowExitModal(false)}
              >
                Cancel
              </button>
              <button
                id="btn-modal-admin-exit-confirm"
                type="button"
                className="modal-danger-btn"
                onClick={() => {
                  setShowExitModal(false);
                  onBackToKiosk();
                }}
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}