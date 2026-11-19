import React, { useState } from 'react';

export default function MenuScreen({ student, menuItems, onHomeClick, onOrderSuccess }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [tray, setTray] = useState({});

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

  const handleCheckout = async () => {
    if (trayItems.length === 0) return;
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student?.id || 'GUEST',
          items: trayItems,
          total: trayTotal
        })
      });
      const data = await res.json();
      onOrderSuccess({
        orderId: data.orderId || Math.floor(1000 + Math.random() * 9000),
        total: trayTotal,
        points: data.pointsEarned || Math.floor(trayTotal / 100)
      });
      setTray({});
    } catch {
      onOrderSuccess({
        orderId: Math.floor(1000 + Math.random() * 9000),
        total: trayTotal,
        points: Math.floor(trayTotal / 100)
      });
      setTray({});
    }
  };

  const filteredMenu = menuItems.filter(item => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.chinese_name && item.chinese_name.includes(searchQuery));
    return matchCat && matchSearch;
  });

  return (
    <div className="menu-screen">
      <header className="menu-navbar">
        <div className="logo-group clickable" onClick={onHomeClick}>
          <span className="logo-text dark">MING</span>
          <span className="logo-badge dark">24</span>
        </div>

        <div className="nav-center-greeting">
          GOOD DAY, {student?.name?.toUpperCase() || 'STUDENT'}!
        </div>

        <div className="nav-right">
          {student?.id !== 'GUEST' && (
            <div className="rewards-badge">
              <span>★ {student?.points || 0} Points</span>
            </div>
          )}
          <div className="tray-counter-pill">
            Tray: {trayItems.reduce((a, c) => a + c.qty, 0)} items
          </div>
        </div>
      </header>

      <div className="menu-container">
        <div className="menu-items-col">
          <div className="menu-header-row">
            <h1 className="craving-title">What are you craving?</h1>
            <div className="search-bar">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="category-scroll">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="food-grid">
            {filteredMenu.map(item => (
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
                  <button className="add-tray-btn" onClick={() => addToTray(item)}>
                    Add to tray +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                      <button onClick={() => removeFromTray(item.id)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => addToTray(item)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="tray-footer">
                <div className="tray-total-line">
                  <span>Total:</span>
                  <span className="tray-total-sum">₱{trayTotal.toFixed(2)}</span>
                </div>
                <button className="confirm-checkout-btn" onClick={handleCheckout}>
                  Checkout (₱{trayTotal.toFixed(2)})
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}