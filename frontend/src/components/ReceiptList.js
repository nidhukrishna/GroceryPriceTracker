import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext, { API_BASE_URL } from '../context/AuthContext';

const ReceiptList = ({ refreshKey = 0, onReceiptsLoaded }) => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authTokens } = useContext(AuthContext);

  useEffect(() => {
    const fetchReceipts = async () => {
      if (!authTokens) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/api/receipt/`, {
          headers: { Authorization: 'Bearer ' + String(authTokens.access) },
        });
        setReceipts(response.data);
        if (onReceiptsLoaded) onReceiptsLoaded(response.data);
      } catch (error) {
        console.error('Error fetching receipts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, [authTokens, refreshKey, onReceiptsLoaded]);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Recent Receipts</h3>
          <p className="card-subtitle">Click a receipt to inspect items & prices</p>
        </div>
        <span className="badge">{receipts.length} total</span>
      </div>

      {loading ? (
        <div className="empty-state">Loading receipts...</div>
      ) : receipts.length > 0 ? (
        <ul className="item-list">
          {receipts.map((receipt) => {
            const total = (receipt.items || []).reduce(
              (sum, i) => sum + parseFloat(i.price || 0),
              0
            );
            const dateStr = new Date(receipt.processed_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <li key={receipt.id}>
                <Link to={`/receipt/${receipt.id}`} className="item-row">
                  <div>
                    <div style={{ fontWeight: 600 }}>Receipt #{receipt.id}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {dateStr} • {(receipt.items || []).length} items
                    </div>
                  </div>
                  <div className="price-tag">₹{total.toFixed(2)} →</div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="empty-state">You haven't uploaded any receipts yet.</div>
      )}
    </div>
  );
};

export default ReceiptList;