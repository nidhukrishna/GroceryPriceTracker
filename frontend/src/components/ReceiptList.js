import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const ReceiptList = () => {
  // ... (keep all the existing state and useEffect code)
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authTokens } = useContext(AuthContext);
  const API_BASE_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchReceipts = async () => {
      if (!authTokens) { setLoading(false); return; }
      try {
        const response = await axios.get(`${API_BASE_URL}/api/receipt/`, {
          headers: { 'Authorization': 'Bearer ' + String(authTokens.access) }
        });
        setReceipts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching receipts:", error);
        setLoading(false);
      }
    };
    fetchReceipts();
  }, [authTokens]);

  if (loading) { return <p>Loading receipts...</p>; }

  return (
    <div>
      <h3>Your Uploaded Receipts</h3>
      {receipts.length > 0 ? (
        <ul>
          {receipts.map(receipt => (
            // Wrap the list item in a Link component
            <li key={receipt.id}>
              <Link to={`/receipt/${receipt.id}`}>
                Receipt from {new Date(receipt.processed_date).toLocaleDateString()}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't uploaded any receipts yet.</p>
      )}
    </div>
  );
};

export default ReceiptList;