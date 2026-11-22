import React, { useState } from 'react';

export default function AdminPinModal({ isOpen, onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === '1234') {
      setPin('');
      setErrorMessage('');
      onSuccess();
    } else {
      setErrorMessage('Incorrect PIN. Default is 1234.');
      setPin('');
    }
  };

  const handleClose = () => {
    setPin('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal-card pin-modal-card">
        <div className="modal-top-bar">
          <div className="modal-icon-badge">🔒</div>
          <button 
            id="btn-modal-pin-close" 
            type="button" 
            className="modal-x-btn" 
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <h3 className="custom-modal-title">Staff Admin Verification</h3>
        <p className="custom-modal-sub">
          Enter the 4-digit security PIN to access the product management portal.
        </p>

        {errorMessage && <div className="modal-error-box">{errorMessage}</div>}

        <form onSubmit={handleSubmit} className="modal-pin-form">
          <input
  id="input-modal-admin-pin"
  type="password"
  maxLength="6"
  autoFocus
  placeholder="Enter Staff PIN"
  value={pin}
  onChange={(e) => {
    setPin(e.target.value);
    setErrorMessage('');
  }}
  className="pin-big-input"
/>

          <div className="modal-actions-row">
            <button 
              id="btn-modal-pin-cancel" 
              type="button" 
              className="modal-secondary-btn" 
              onClick={handleClose}
            >
              Cancel
            </button>
            <button 
              id="btn-modal-pin-submit" 
              type="submit" 
              className="modal-primary-btn"
            >
              Unlock Admin Portal →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}