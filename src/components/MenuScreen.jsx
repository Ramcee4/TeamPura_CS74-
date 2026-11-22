import React, { useState } from 'react';

export default function MenuScreen({ student, menuItems, onHomeClick, onProceedToPayment, onLogout }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [tray, setTray] = useState({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const categories = ['All', 'Dim Sum & Bao', 'Rice & Wok', 'Quick Bites', 'Drinks & Desserts'];

  const addToTray = (item) => {
    setTray(prev => ({
      ...prev,
      [item.id]: {
        ...item,
        qty: (prev[item.id]?.qty || 0) + 1
      }
    }));
  };

  const removeFromTray = (itemId) => {
    setTray(prev => {
      const updated = { ...prev };
      if (updated[itemId]?.qty > 1) {
        updated[itemId].qty -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  const trayItems = Object.values(tray);
  const trayTotal = trayItems.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

  const handleCheckout = () => {
    if (trayItems.length === 0) return;
    onProceedToPayment(trayItems);
  };

  const filteredMenu = menuItems.filter(item => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.chinese_name && item.chinese_name.includes(searchQuery));
    return matchCat && matchSearch;
  });

  return (
    <div className="menu-screen">
      {/* Top Navbar */}
      <header className="menu-navbar">
        <div className="logo-group clickable" onClick={onHomeClick}>
          <span className="logo-text dark">MING</span>
          <span className="logo-badge dark">24</span>
        </div>

        <div className="nav-center-greeting">
          GOOD DAY, {student?.name?.toUpperCase() || 'STUDENT'}!
        </div>

        <div className="nav-right">
          <div className="rewards-badge">
            <span>★ {student?.points || 0} Points</span>
          </div>

          <div className="tray-counter-pill">
            Tray: {trayItems.reduce((a, c) => a + c.qty, 0)} items
          </div>

          {/* Trigger Logout Modal */}
          <button 
            id="btn-menu-logout" 
            type="button" 
            className="menu-logout-btn" 
            onClick={() => setShowLogoutModal(true)}
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="menu-container">
        <div className="menu-items-col">
          <div className="menu-header-row">
            <h1 className="craving-title">What are you craving?</h1>
            <div className="search-bar">
              <span>🔍</span>
              <input
                id="input-menu-search"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="category-scroll">
            {categories.map(cat => (
              <button
                key={cat}
                id={`btn-category-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                type="button"
                className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Food Grid */}
          <div className="food-grid">
            {filteredMenu.length === 0 ? (
              <div className="empty-menu-alert">
                <h3>No dishes in this category yet.</h3>
              </div>
            ) : (
              filteredMenu.map(item => (
                <div key={item.id} className="food-card">
                  <div className="food-thumb-wrap">
                    <img src={item.image} alt={item.name} className="food-thumb" />
                    {item.tag && <span className="food-badge">{item.tag}</span>}
                  </div>
                  <div className="food-card-body">
                    <div className="food-title-row">
                      <span className="food-name">{item.name}</span>
                      <span className="food-price">₱{item.price}</span>
                    </div>
                    <span className="food-cn-name">{item.chinese_name}</span>
                    <button 
                      id={`btn-add-tray-${item.id}`}
                      type="button"
                      className="add-tray-btn" 
                      onClick={() => addToTray(item)}
                    >
                      Add to tray +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Tray Sidebar */}
        <aside className="tray-sidebar">
          <h2 className="tray-title">My Tray</h2>

          {trayItems.length === 0 ? (
            <div className="empty-tray-state">
              <div className="tray-icon-circle">🛒</div>
              <h3>Your tray is empty</h3>
              <p>Pick items from the menu to build your order.</p>
            </div>
          ) : (
            <div className="active-tray-content">
              <div className="tray-items-list">
                {trayItems.map(item => (
                  <div key={item.id} className="tray-item-row">
                    <div>
                      <p className="tray-item-name">{item.name}</p>
                      <span className="tray-item-single-price">₱{item.price} each</span>
                    </div>
                    <div className="tray-controls">
                      <button 
                        id={`btn-tray-minus-${item.id}`}
                        type="button"
                        onClick={() => removeFromTray(item.id)}
                      >
                        -
                      </button>
                      <span>{item.qty}</span>
                      <button 
                        id={`btn-tray-plus-${item.id}`}
                        type="button"
                        onClick={() => addToTray(item)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="tray-footer">
                <div className="tray-total-line">
                  <span>Total:</span>
                  <span className="tray-total-sum">₱{trayTotal.toFixed(2)}</span>
                </div>
                <button 
                  id="btn-confirm-checkout" 
                  type="button"
                  className="confirm-checkout-btn" 
                  onClick={handleCheckout}
                >
                  Checkout (₱{trayTotal.toFixed(2)})
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card">
            <div className="modal-icon-badge warning">🚪</div>
            <h3 className="custom-modal-title">Log Out?</h3>
            <p className="custom-modal-sub">
              Are you sure you want to end your session? Your current tray will be cleared.
            </p>
            <div className="modal-actions-row">
              <button
                id="btn-modal-logout-cancel"
                type="button"
                className="modal-secondary-btn"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                id="btn-modal-logout-confirm"
                type="button"
                className="modal-danger-btn"
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}