import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext, { API_BASE_URL } from '../context/AuthContext';
import CategoryPieChart from '../components/CategoryPieChart';

const ReceiptDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authTokens } = useContext(AuthContext);

  useEffect(() => {
    const fetchReceiptDetail = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/receipt/${id}/`, {
          headers: { Authorization: 'Bearer ' + String(authTokens.access) },
        });
        setReceipt(response.data);
      } catch (error) {
        console.error('Error fetching receipt details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReceiptDetail();
  }, [id, authTokens]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this receipt and all its items?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/receipt/${id}/`, {
        headers: { Authorization: 'Bearer ' + String(authTokens.access) },
      });
      navigate('/');
    } catch (error) {
      alert('Failed to delete receipt.');
    }
  };

  if (loading) {
    return <div className="container empty-state">Loading receipt details...</div>;
  }

  if (!receipt) {
    return (
      <div className="container empty-state">
        <p>Receipt not found.</p>
        <Link to="/" className="btn btn-outline">← Back to Dashboard</Link>
      </div>
    );
  }

  const totalSpent = (receipt.items || []).reduce(
    (sum, item) => sum + parseFloat(item.price || 0),
    0
  );

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <span className="brand-badge">🛒</span>
            <span>GrocTrack</span>
          </Link>
          <div className="nav-actions">
            <Link to="/" className="btn btn-outline">← Dashboard</Link>
            <button onClick={handleDelete} className="btn btn-danger">
              Delete Receipt
            </button>
          </div>
        </div>
      </nav>

      <main className="container">
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Receipt #{receipt.id} Date</div>
            <p className="kpi-value" style={{ fontSize: '1.25rem' }}>
              {new Date(receipt.processed_date).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Total Receipt Amount</div>
            <p className="kpi-value">₹{totalSpent.toFixed(2)}</p>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Items Extracted</div>
            <p className="kpi-value">{(receipt.items || []).length}</p>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Purchased Items</h3>
                <p className="card-subtitle">Click an item to compare its price across receipts</p>
              </div>
            </div>

            <ul className="item-list">
              {(receipt.items || []).map((item, index) => (
                <li key={index}>
                  <Link
                    to={`/history/${encodeURIComponent(item.item_name)}`}
                    className="item-row"
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.item_name}</div>
                      <span className="badge" style={{ marginTop: '0.25rem' }}>
                        {item.category}
                      </span>
                    </div>
                    <div className="price-tag">₹{parseFloat(item.price).toFixed(2)}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <CategoryPieChart receiptId={id} />
        </div>
      </main>
    </div>
  );
};

export default ReceiptDetailPage;