import React, { useState } from 'react';

export default function OrderConfirmationScreen({ orderResult, onEndSession, onOrderMore, onStudentUpdate }) {
  const [studentData, setStudentData] = useState(
    orderResult?.updatedStudent || orderResult?.student || null
  );
  const [currentPoints, setCurrentPoints] = useState(
    orderResult?.updatedStudent?.points ?? orderResult?.student?.points ?? 58
  );
  const [redeemModal, setRedeemModal] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const studentId = String(studentData?.id || '');
  const studentName = studentData?.name || 'STUDENT MEMBER';

  const formattedId = studentId.length === 7
    ? `${studentId.slice(0, 3)} • • ${studentId.slice(-3)}`
    : studentId || 'GUEST';

  const treatsList = [
    {
      id: 'milktea',
      title: 'Free Pearl Milk Tea',
      desc: 'Choice of classic or brown sugar',
      cost: 50,
      icon: '🧋',
      btnId: 'btn-redeem-milktea'
    },
    {
      id: 'dumplings',
      title: 'Free Crystal Shrimp Dumplings',
      desc: 'Valid on your next order',
      cost: 300,
      icon: '🥟',
      btnId: 'btn-redeem-dumplings'
    },
    {
      id: 'discount',
      title: '₱100 off your meal',
      desc: 'Minimum order of ₱1,000',
      cost: 500,
      icon: '🎫',
      btnId: 'btn-redeem-discount'
    },
    {
      id: 'noodles',
      title: 'Free Specialty Noodles',
      desc: 'Any bowl, any day',
      cost: 800,
      icon: '🍜',
      btnId: 'btn-redeem-noodles'
    }
  ];

  const handleRedeem = async (treat) => {
    if (!studentData?.id || studentData.id === 'GUEST') {
      setRedeemModal({
        success: false,
        title: 'Member Only',
        message: 'Guest orders cannot redeem points. Please register your student ID to earn and spend rewards!'
      });
      return;
    }

    if (currentPoints < treat.cost) {
      const diff = treat.cost - currentPoints;
      setRedeemModal({
        success: false,
        title: 'Not Enough Points',
        message: `You have ${currentPoints} PTS. You need ${diff} more points to redeem "${treat.title}".`
      });
      return;
    }

    setIsRedeeming(true);
    try {
      const res = await fetch('http://localhost:5000/api/treats/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentData.id,
          treat_title: treat.title,
          points_cost: treat.cost
        })
      });

      if (!res.ok) {
        let errMsg = 'Please restart "node server.js" in your terminal to enable redemption.';
        try {
          const errData = await res.json();
          if (errData.error) errMsg = errData.error;
        } catch {
          // Response was not JSON
        }
        setRedeemModal({
          success: false,
          title: 'Redemption Failed',
          message: errMsg
        });
        setIsRedeeming(false);
        return;
      }

      const data = await res.json();
      if (data.success) {
        const updated = data.updatedStudent || data.student;
        setStudentData(updated);
        setCurrentPoints(updated.points);
        if (onStudentUpdate) onStudentUpdate(updated);

        setRedeemModal({
          success: true,
          title: '🎉 Treat Redeemed!',
          message: `You successfully redeemed "${treat.title}" for ${treat.cost} PTS! Please claim it at the counter.`
        });
      }
    } catch {
      setRedeemModal({
        success: false,
        title: 'Server Error',
        message: 'Could not connect to database server. Please ensure "node server.js" is running.'
      });
    }
    setIsRedeeming(false);
  };

  return (
    <div className="confirmation-page-container">
      <section className="confirmation-banner">
        <header className="banner-top-header">
          <div className="logo-group">
            <span className="logo-text">MING</span>
            <span className="logo-badge">24</span>
          </div>
          <button id="btn-end-session" type="button" className="end-session-btn" onClick={onEndSession}>
            End session
          </button>
        </header>

        <div className="banner-hero-grid">
          <div className="banner-left-text">
            <div className="success-status-pill">
              <span>✓ Payment successful</span>
            </div>
            <span className="student-club-tag">MING 24 STUDENT CLUB</span>
            <h1 className="banner-main-title">
              Your good food goes<br />further
            </h1>
            <p className="banner-sub-desc">
              Eat, earn, and unlock something delicious everytime you visit.
            </p>
          </div>

          <div className="digital-student-card">
            <div className="card-top">
              <span className="card-label">ACCUMULATED REWARD POINTS</span>
              <span className="card-chip-icon">★</span>
            </div>
            <div className="card-balance">
              {currentPoints} <span className="card-pts-label">PTS</span>
            </div>
            <div className="card-bottom">
              <span>{studentName.toUpperCase()}</span>
              <span className="masked-id">{formattedId}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="confirmation-dashboard">
        <div className="dashboard-grid">
          <div className="dash-card rewards-card">
            <span className="dash-card-label">YOUR REWARDS</span>
            <div className="points-display">
              <span className="points-number">{currentPoints}</span>
              <span className="points-unit">PTS</span>
            </div>
            <p className="points-sub-info">
              {currentPoints >= 500
                ? 'You have unlocked free meals!'
                : `${500 - currentPoints} more points for your next free meal.`}
            </p>

            <div className="progress-bar-wrap">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.min(100, (currentPoints / 500) * 100)}%` }}
              ></div>
            </div>
            <div className="progress-bar-labels">
              <span>0</span>
              <span className="active-mark">{currentPoints}</span>
              <span>500</span>
            </div>

            <div className="rewards-stats-row">
              <div className="stat-col">
                <span className="stat-name">Orders</span>
                <span className="stat-value">{studentData?.orders_count || 1}</span>
              </div>
              <div className="stat-col">
                <span className="stat-name">Points Earned Today</span>
                <span className="stat-value">+{orderResult?.pointsEarned || 0}</span>
              </div>
              <div className="stat-col">
                <span className="stat-name">Member tier</span>
                <span className="stat-value">{studentData?.member_tier || 'Silver'}</span>
              </div>
            </div>
          </div>

          <div className="dash-card treats-card">
            <div className="treats-header">
              <div>
                <span className="dash-card-label">SPEND YOUR POINTS</span>
                <h3 className="treats-title">Choose a treat</h3>
              </div>
              <span className="available-count">{treatsList.length} AVAILABLE</span>
            </div>

            <div className="treats-list">
              {treatsList.map(treat => {
                const canAfford = currentPoints >= treat.cost;
                return (
                  <div key={treat.id} className="treat-row">
                    <div className="treat-icon-box">{treat.icon}</div>
                    <div className="treat-info">
                      <h4>{treat.title}</h4>
                      <p>{treat.desc}</p>
                    </div>
                    <div className="treat-action">
                      <span className="treat-cost">{treat.cost} PTS</span>
                      <button
                        id={treat.btnId}
                        type="button"
                        className={`redeem-btn ${canAfford ? 'can-redeem' : ''}`}
                        onClick={() => handleRedeem(treat)}
                        disabled={isRedeeming}
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <footer className="confirmation-footer-bar">
        <p className="footer-status-text">Your order is confirmed and sent to the kitchen.</p>
        <button id="btn-order-more" type="button" className="order-more-btn" onClick={onOrderMore}>
          Order more →
        </button>
      </footer>

      {redeemModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card">
            <div className={`modal-icon-badge ${redeemModal.success ? '' : 'warning'}`}>
              {redeemModal.success ? '🎁' : '⚠️'}
            </div>
            <h3 className="custom-modal-title">{redeemModal.title}</h3>
            <p className="custom-modal-sub">{redeemModal.message}</p>
            <div className="modal-actions-row">
              <button
                id="btn-modal-redeem-close"
                type="button"
                className="modal-primary-btn"
                onClick={() => setRedeemModal(null)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}