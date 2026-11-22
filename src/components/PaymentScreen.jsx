import React, { useState } from 'react';

export default function PaymentScreen({ student, trayItems, onBackToMenu, onPaymentSuccess }) {
  const [diningOption, setDiningOption] = useState('dine-in'); // 'dine-in' | 'take-out'
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'gcash'
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = trayItems.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  const serviceFee = subtotal * 0.05;
  const total = subtotal + serviceFee;
  const rewardPoints = Math.floor(total / 100);
  const randomOrderNum = Math.floor(1000 + Math.random() * 9000);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student?.id || 'GUEST',
          items: trayItems,
          dining_option: diningOption,
          payment_method: paymentMethod,
          total: total
        })
      });
      const data = await res.json();
      onPaymentSuccess({
        orderId: data.orderId || randomOrderNum,
        total: total,
        pointsEarned: data.pointsEarned || rewardPoints,
        updatedStudent: data.student
      });
    } catch {
      onPaymentSuccess({
        orderId: randomOrderNum,
        total: total,
        pointsEarned: rewardPoints,
        updatedStudent: {
          ...student,
          points: (student?.points || 50) + rewardPoints
        }
      });
    }
  };

  return (
    <div className="payment-page-container">
      <header className="payment-top-nav">
        <button id="btn-checkout-back" type="button" className="nav-back-btn" onClick={onBackToMenu}>
          ‹ Back to menu
        </button>
        <div className="logo-group">
          <span className="logo-text dark">MING</span>
          <span className="logo-badge dark">24</span>
        </div>
        <div className="secure-badge">✓ SECURE CHECKOUT</div>
      </header>

      <main className="payment-body-grid">
        <div className="payment-left-col">
          <span className="step-tag">01 / IDENTIFY</span>
          <h1 className="payment-heading">Almost ready!</h1>
          <p className="payment-subheading">Review your order and choose how you'd like to pay.</p>

          {/* 1. Dining Option */}
          <section className="selection-section">
            <h3 className="section-title">
              <span className="num-circle">1</span> How will you enjoy it?
            </h3>
            <div className="options-row">
              <button
                id="btn-option-dine-in"
                type="button"
                className={`choice-card ${diningOption === 'dine-in' ? 'selected' : ''}`}
                onClick={() => setDiningOption('dine-in')}
              >
                <div className="choice-icon">🍲</div>
                <div className="choice-text">
                  <h4>Dine in</h4>
                  <p>We'll call your number</p>
                </div>
                {diningOption === 'dine-in' && <span className="check-badge">✓</span>}
              </button>

              <button
                id="btn-option-take-out"
                type="button"
                className={`choice-card ${diningOption === 'take-out' ? 'selected' : ''}`}
                onClick={() => setDiningOption('take-out')}
              >
                <div className="choice-icon">🛍️</div>
                <div className="choice-text">
                  <h4>Take out</h4>
                  <p>to go</p>
                </div>
                {diningOption === 'take-out' && <span className="check-badge">✓</span>}
              </button>
            </div>
          </section>

          {/* 2. Payment Method: CASH & GCASH */}
          <section className="selection-section">
            <h3 className="section-title">
              <span className="num-circle">2</span> Payment method
            </h3>
            <div className="payment-methods-stack">
              {/* Option 1: Cash */}
              <button
                id="btn-pay-method-cash"
                type="button"
                className={`method-card ${paymentMethod === 'cash' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <div className="method-left">
                  <div className="method-icon-box crimson">💵</div>
                  <div>
                    <h4>Cash</h4>
                    <p>Pay at cashier counter or kiosk cash slot</p>
                  </div>
                </div>
                {paymentMethod === 'cash' && <span className="check-badge">✓</span>}
              </button>

              {/* Option 2: GCash */}
              <button
                id="btn-pay-method-gcash"
                type="button"
                className={`method-card ${paymentMethod === 'gcash' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('gcash')}
              >
                <div className="method-left">
                  <div className="method-icon-box gcash-box">📱</div>
                  <div>
                    <h4>GCash</h4>
                    <p>Scan QR code or pay with GCash Mobile</p>
                  </div>
                </div>
                {paymentMethod === 'gcash' && <span className="check-badge">✓</span>}
              </button>
            </div>
          </section>
        </div>

        {/* Right Side: Order Summary */}
        <aside className="payment-right-col">
          <div className="summary-card">
            <div className="summary-header">
              <h3>ORDER SUMMARY</h3>
              <span className="order-tag-num">#{randomOrderNum}</span>
            </div>

            <div className="summary-items-list">
              {trayItems.map(item => (
                <div key={item.id} className="summary-item-row">
                  <img src={item.image} alt={item.name} className="summary-item-img" />
                  <div className="summary-item-details">
                    <p className="summary-item-name">{item.name}</p>
                    <span className="summary-item-qty">{item.chinese_name} • Qty {item.qty}</span>
                  </div>
                  <span className="summary-item-total">₱{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            <div className="summary-pricing-table">
              <div className="pricing-row">
                <span>Subtotal</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="pricing-row">
                <span>Service fee</span>
                <span>₱{serviceFee.toFixed(2)}</span>
              </div>
              <div className="pricing-row total-row">
                <span>Total</span>
                <span className="grand-total">₱{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Points Reward Box */}
            <div className="reward-notice-pill">
              <span className="reward-icon">🎁</span>
              <div>
                <strong>+{rewardPoints} Student Points Earned</strong>
                <p>Will be added to your account upon checkout</p>
              </div>
            </div>

            <button
              id="btn-pay-now"
              type="button"
              className="pay-now-btn"
              onClick={handlePay}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing Order...' : `Pay ₱${total.toFixed(2)} →`}
            </button>

            <p className="estimate-time-note">🕒 Ready in approximately 10–15 minutes</p>
          </div>
        </aside>
      </main>
    </div>
  );
}