import React, { useState } from 'react';

export default function RegisterScreen({ onBack, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    contact_number: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Strictly 7-digit integer for Student ID
    if (name === 'id') {
      const numbersOnly = value.replace(/\D/g, '').slice(0, 7);
      setFormData(prev => ({ ...prev, id: numbersOnly }));
      setErrorMsg('');
      return;
    }

    // Strictly 11-digit integer for Contact Number (e.g. 09XXXXXXXXX)
    if (name === 'contact_number') {
      const numbersOnly = value.replace(/\D/g, '').slice(0, 11);
      setFormData(prev => ({ ...prev, contact_number: numbersOnly }));
      setErrorMsg('');
      return;
    }

    // Auto-remove spaces and convert email to lowercase
    if (name === 'email') {
      const cleanEmail = value.replace(/\s/g, '').toLowerCase();
      setFormData(prev => ({ ...prev, email: cleanEmail }));
      setErrorMsg('');
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate 7-digit Student ID
    if (formData.id.length !== 7) {
      setErrorMsg('Student ID must be exactly 7 digits.');
      return;
    }

    // 2. Validate Full Name
    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    // 3. Validate 11-digit Contact Number
    if (formData.contact_number.length !== 11) {
      setErrorMsg('Contact number must be exactly 11 digits.');
      return;
    }

    // 4. Validate @gmail.com
    const email = formData.email.trim();
    if (!email) {
      setErrorMsg('Please enter your Gmail address.');
      return;
    }
    if (!email.endsWith('@gmail.com') || email === '@gmail.com') {
      setErrorMsg('Email must be a valid address ending with @gmail.com.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Registration failed.');
        setIsLoading(false);
        return;
      }

      onRegisterSuccess(data.student);
    } catch {
      onRegisterSuccess({
        id: formData.id,
        name: formData.name,
        email: formData.email,
        contact_number: formData.contact_number,
        points: 50
      });
    }
  };

  return (
    <div className="keypad-split-screen">
      <div className="keypad-left-banner">
        <div className="banner-nav">
          <div className="logo-group">
            <span className="logo-text">MING</span>
            <span className="logo-badge">24</span>
          </div>
          <span className="student-club-tag">Kiosk Registration</span>
        </div>

        <div className="banner-food-graphic">
          <img
            src="https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80"
            alt="Dim sum banquet"
            className="banner-img"
          />
        </div>

        <div className="banner-footer-text">
          <span className="member-label">EXCLUSIVE KIOSK PERKS</span>
          <h2 className="banner-tagline">Sign up.<br />Get 50 points.</h2>
          <div className="reward-pill">🎁 50 Welcome Points + 1 point / ₱100 spent</div>
        </div>
      </div>

      <div className="keypad-right-panel register-panel">
        <button 
          id="btn-register-back" 
          type="button"
          className="back-link" 
          onClick={onBack}
        >
          ‹ Back to Login
        </button>

        <div className="kiosk-register-box">
          <span className="step-tag">01 / MEMBERSHIP</span>
          <h2 className="identify-title">Join MING 24</h2>
          <p className="identify-subtitle">
            Enter your details on this kiosk to claim your welcome reward and start earning points.
          </p>

          {errorMsg && <div className="kiosk-error-alert">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="kiosk-form">
            <div className="kiosk-input-group">
              <label>STUDENT / MEMBER ID (7 DIGITS) *</label>
              <input
                id="input-register-id"
                type="text"
                name="id"
                inputMode="numeric"
                maxLength="7"
                value={formData.id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="kiosk-input-group">
              <label>FULL NAME *</label>
              <input
                id="input-register-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="kiosk-input-group">
              <label>CONTACT NUMBER (11 DIGITS) *</label>
              <input
                id="input-register-contact"
                type="tel"
                name="contact_number"
                inputMode="numeric"
                maxLength="11"
                value={formData.contact_number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="kiosk-input-group">
              <label>EMAIL ADDRESS (@GMAIL.COM) *</label>
              <input
                id="input-register-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <button 
              id="btn-register-submit" 
              type="submit" 
              className="continue-btn active kiosk-submit-btn" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Complete & Start Ordering →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}