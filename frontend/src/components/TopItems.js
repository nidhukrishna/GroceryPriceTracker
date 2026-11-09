import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext, { API_BASE_URL } from '../context/AuthContext';

const TopItems = ({ refreshKey = 0 }) => {
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authTokens } = useContext(AuthContext);

  useEffect(() => {
    const fetchTopItems = async () => {
      if (!authTokens) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/receipt/top-items/`, {
          headers: { Authorization: 'Bearer ' + String(authTokens.access) },
        });
        setTopItems(response.data);
      } catch (error) {
        console.error('Error fetching top items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopItems();
  }, [authTokens, refreshKey]);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Most Frequent Items</h3>
          <p className="card-subtitle">Click any item to view its price history</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading frequent items...</div>
      ) : topItems.length > 0 ? (
        <ul className="item-list">
          {topItems.map((item, idx) => (
            <li key={idx}>
              <Link
                to={`/history/${encodeURIComponent(item.item_name)}`}
                className="item-row"
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{item.item_name}</div>
                  {item.total_spent && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Total spent: ₹{parseFloat(item.total_spent).toFixed(2)}
                    </div>
                  )}
                </div>
                <span className="badge badge-green">{item.item_count}× bought</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">No items recorded yet.</div>
      )}
    </div>
  );
};

export default TopItems;