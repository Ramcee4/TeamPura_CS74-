import React, { useState } from 'react';

export default function KeypadScreen({ onBack, onStudentSubmit, onGuestSubmit }) {
  const [studentId, setStudentId] = useState('');

  const handleNumClick = (digit) => {
    if (studentId.length < 8) {
      setStudentId(prev => prev + digit);
    }
  };

  const handleClear = () => setStudentId('');
  const handleDelete = () => setStudentId(prev => prev.slice(0, -1));

  return (
    <div className="keypad-split-screen">
      {/* Left Red Banner */}
      <div className="keypad-left-banner">
        <div className="banner-nav">
          <div className="logo-group">
            <span className="logo-text">MING</span>
            <span className="logo-badge">24</span>
          </div>
          <span className="student-club-tag">Student Club</span>
        </div>

        <div className="banner-food-graphic">
          <img
            src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"
            alt="Student rewards food"
            className="banner-img"
          />
        </div>

        <div className="banner-footer-text">
          <span className="member-label">MEMBERS EAT BETTER</span>
          <h2 className="banner-tagline">Tap in.<br />Stack rewards.</h2>
          <div className="reward-pill">Earn 1 point for every ₱100 spent</div>
        </div>
      </div>

      {/* Right Keypad Form */}
      <div className="keypad-right-panel">
        <button className="back-link" onClick={onBack}>
          ‹ Back
        </button>

        <div className="keypad-form-wrapper">
          <span className="step-tag">01 / IDENTIFY</span>
          <h2 className="identify-title">Hello there!</h2>
          <p className="identify-subtitle">
            Enter your Student ID to view your balance and earn rewards with this order.
          </p>

          <div className="student-id-display-box">
            <span className="input-label">STUDENT ID</span>
            <div className="digits-display">
              {studentId || <span className="placeholder-digits">0000000</span>}
            </div>
          </div>

          <div className="numeric-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button key={num} className="key-btn" onClick={() => handleNumClick(num.toString())}>
                {num}
              </button>
            ))}
            <button className="key-btn action-key" onClick={handleClear}>CLR</button>
            <button className="key-btn" onClick={() => handleNumClick('0')}>0</button>
            <button className="key-btn action-key" onClick={handleDelete}>DEL</button>
          </div>

          <button
            className={`continue-btn ${studentId.length >= 4 ? 'active' : ''}`}
            onClick={() => onStudentSubmit(studentId)}
          >
            Continue →
          </button>
          <button className="guest-link" onClick={onGuestSubmit}>
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}