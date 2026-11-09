import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext, { API_BASE_URL } from '../context/AuthContext';

const ItemHistoryPage = () => {
  const { itemName } = useParams();
  const decodedName = decodeURIComponent(itemName);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authTokens } = useContext(AuthContext);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/receipt/history/${encodeURIComponent(decodedName)}/`,
          {
            headers: { Authorization: 'Bearer ' + String(authTokens.access) },
          }
        );
        setData(response.data);
      } catch (error) {
        console.error('Error fetching item history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [decodedName, authTokens]);

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <span className="brand-badge">🛒</span>
            <span>GrocTrack</span>
          </Link>
          <Link to="/" className="btn btn-outline">← Back to Dashboard</Link>
        </div>
      </nav>

      <main className="container">
        {loading ? (
          <div className="empty-state">Loading price history...</div>
        ) : !data || !data.history || data.history.length === 0 ? (
          <div className="card empty-state">No history found for "{decodedName}".</div>
        ) : (
          <>
            <h2 style={{ marginBottom: '1rem' }}>Price History: {decodedName}</h2>

            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-label">Lowest Price Paid</div>
                <p className="kpi-value" style={{ color: '#059669' }}>
                  ₹{parseFloat(data.stats.min_price || 0).toFixed(2)}
                </p>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Average Price</div>
                <p className="kpi-value">
                  ₹{parseFloat(data.stats.avg_price || 0).toFixed(2)}
                </p>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Highest Price Paid</div>
                <p className="kpi-value" style={{ color: '#dc2626' }}>
                  ₹{parseFloat(data.stats.max_price || 0).toFixed(2)}
                </p>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Times Purchased</div>
                <p className="kpi-value">{data.stats.times_bought}</p>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Purchase Timeline</h3>
              </div>
              <ul className="item-list">
                {data.history.map((record) => (
                  <li key={record.id}>
                    <Link to={`/receipt/${record.receipt_id}`} className="item-row">
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {new Date(record.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Receipt #{record.receipt_id} • {record.category}
                        </div>
                      </div>
                      <div className="price-tag">₹{record.price.toFixed(2)}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ItemHistoryPage;