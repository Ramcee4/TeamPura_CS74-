import React, { useState } from 'react';

export default function KeypadScreen({ onBack, onStudentSubmit, onGoToRegister, errorMessage }) {
  const [studentId, setStudentId] = useState('');

  // Lock to 7 digits maximum
  const handleNumClick = (digit) => {
    if (studentId.length < 7) {
      setStudentId(prev => prev + digit);
    }
  };

  const handleClear = () => setStudentId('');
  const handleDelete = () => setStudentId(prev => prev.slice(0, -1));

  const isComplete = studentId.length === 7;

  return (
    <div className="keypad-split-screen">
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

      <div className="keypad-right-panel">
        <button 
          id="btn-keypad-back" 
          type="button"
          className="back-link" 
          onClick={onBack}
        >
          ‹ Back
        </button>

        <div className="keypad-form-wrapper">
          <span className="step-tag">01 / IDENTIFY</span>
          <h2 className="identify-title">Hello there!</h2>
          <p className="identify-subtitle">
            Enter your 7-digit Student ID to check your account in the database.
          </p>

          {errorMessage && <div className="kiosk-error-alert">{errorMessage}</div>}

          <div className="student-id-display-box">
            <span className="input-label">STUDENT ID ({studentId.length}/7 DIGITS)</span>
            <div className="digits-display">
              {studentId || <span className="placeholder-digits">0000000</span>}
            </div>
          </div>

          <div className="numeric-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button 
                key={num} 
                id={`btn-keypad-${num}`} 
                type="button"
                className="key-btn" 
                onClick={() => handleNumClick(num.toString())}
              >
                {num}
              </button>
            ))}
            <button 
              id="btn-keypad-clear" 
              type="button"
              className="key-btn action-key" 
              onClick={handleClear}
            >
              CLR
            </button>
            <button 
              id="btn-keypad-0" 
              type="button"
              className="key-btn" 
              onClick={() => handleNumClick('0')}
            >
              0
            </button>
            <button 
              id="btn-keypad-del" 
              type="button"
              className="key-btn action-key" 
              onClick={handleDelete}
            >
              DEL
            </button>
          </div>

          {/* Clickable ONLY when exactly 7 digits */}
          <button
            id="btn-keypad-continue"
            type="button"
            className={`continue-btn ${isComplete ? 'active' : ''}`}
            disabled={!isComplete}
            onClick={() => {
              if (isComplete) onStudentSubmit(studentId);
            }}
          >
            {isComplete ? 'Verify & Continue →' : `Enter ${7 - studentId.length} more digits`}
          </button>

          <div className="kiosk-extra-actions">
            <button 
              id="btn-keypad-register" 
              type="button"
              className="register-cta-btn" 
              onClick={onGoToRegister}
            >
              ✨ New to MING 24? <strong>Register Here</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}