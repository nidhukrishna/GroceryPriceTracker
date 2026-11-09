import React, { useContext, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ReceiptUpload from '../components/ReceiptUpload';
import ReceiptList from '../components/ReceiptList';
import CategoryPieChart from '../components/CategoryPieChart';
import TopItems from '../components/TopItems';

const HomePage = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ totalSpent: 0, receiptCount: 0, itemCount: 0 });

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleReceiptsLoaded = useCallback((receiptsData) => {
    let spent = 0;
    let items = 0;
    receiptsData.forEach((r) => {
      (r.items || []).forEach((i) => {
        spent += parseFloat(i.price || 0);
        items += 1;
      });
    });
    setStats({
      totalSpent: spent,
      receiptCount: receiptsData.length,
      itemCount: items,
    });
  }, []);

  if (!user) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: 'center', maxWidth: '460px' }}>
          <div className="brand-badge" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            🛒
          </div>
          <h1 className="auth-title">Grocery Price Tracker</h1>
          <p className="auth-subtitle">
            Scan Indian grocery receipts with AI, track item price changes over time, and
            visualize your monthly spending.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-primary" style={{ flex: 1 }}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-outline" style={{ flex: 1 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <span className="brand-badge">🛒</span>
            <span>GrocTrack</span>
          </Link>
          <div className="nav-actions">
            <span className="user-pill">Hi, {user.username}</span>
            <button onClick={logoutUser} className="btn btn-outline">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container">
        {/* KPI Strip */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Total Tracked Spend</div>
            <p className="kpi-value">₹{stats.totalSpent.toFixed(2)}</p>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Receipts Scanned</div>
            <p className="kpi-value">{stats.receiptCount}</p>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Line Items Logged</div>
            <p className="kpi-value">{stats.itemCount}</p>
          </div>
        </div>

        {/* Main 2-Column Dashboard */}
        <div className="dashboard-grid">
          <div className="stack">
            <ReceiptUpload onUploadSuccess={handleUploadSuccess} />
            <ReceiptList
              refreshKey={refreshKey}
              onReceiptsLoaded={handleReceiptsLoaded}
            />
          </div>

          <div className="stack">
            <CategoryPieChart refreshKey={refreshKey} />
            <TopItems refreshKey={refreshKey} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;