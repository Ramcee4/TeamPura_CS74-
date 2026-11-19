import React from 'react';

export default function OrderSuccessModal({ orderData, onClose }) {
  if (!orderData) return null;

  return (
    <div className="success-overlay">
      <div className="success-card">
        <div className="success-check">✓</div>
        <h2>Order Placed to Kitchen!</h2>
        <p>Saved directly into <strong>restaurant.db (SQLite)</strong></p>
        <div className="receipt-details">
          <div><span>Order Number:</span> <strong>#{orderData.orderId}</strong></div>
          <div><span>Total Charged:</span> <strong>₱{orderData.total.toFixed(2)}</strong></div>
          <div><span>Rewards Earned:</span> <strong className="rewards-gold">+{orderData.points} Points</strong></div>
        </div>
        <button className="back-to-menu-btn" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}