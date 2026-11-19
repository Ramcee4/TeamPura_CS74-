import React from 'react';

export default function HomeScreen({ onStartOrder }) {
  return (
    <div className="home-screen">
      <header className="home-header">
        <div className="logo-group">
          <span className="logo-text">MING</span>
          <span className="logo-badge">24</span>
        </div>
        <div className="home-status">
          <span>CHINESE KITCHEN</span>
          <span className="status-dot"></span>
          <span>OPEN 24/7</span>
        </div>
      </header>

      <main className="home-hero">
        <div className="hero-text-col">
          <p className="greeting-sub">你好 • NI HAO!</p>
          <h1 className="main-title">Good food.<br />Good mood.</h1>
          <p className="main-desc">
            Your Chinese street-food fix, made fresh and served fast. Tap in and build your perfect meal.
          </p>
          <button className="cta-start-btn" onClick={onStartOrder}>
            <span>Start your order</span>
            <span className="cta-arrow">→</span>
          </button>
        </div>

        <div className="hero-img-col">
          <img
            src="https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=1200&q=85"
            alt="Chinese Dim Sum and Dumplings"
            className="hero-main-img"
          />
        </div>
      </main>

      <footer className="home-ticker">
        <span>DIM SUM</span> <span>•</span>
        <span>CHOW MEIN</span> <span>•</span>
        <span>XIAOLONGBAO</span> <span>•</span>
        <span>NOODLES</span>
      </footer>
    </div>
  );
}