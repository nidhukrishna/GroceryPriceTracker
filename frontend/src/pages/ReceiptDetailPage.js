import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext, { API_BASE_URL } from '../context/AuthContext';
import CategoryPieChart from '../components/CategoryPieChart';
// Import the existing CSS module from HomePage
import styles from './HomePage.module.css'; 

const ReceiptDetailPage = () => {
    const { id } = useParams();
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);
    const { authTokens } = useContext(AuthContext);

    useEffect(() => {
        const fetchReceiptDetail = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/receipt/${id}/`, {
                    headers: { 'Authorization': 'Bearer ' + String(authTokens.access) }
                });
                setReceipt(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching receipt details:", error);
                setLoading(false);
            }
        };
        fetchReceiptDetail();
    }, [id, authTokens]);

    if (loading) {
        return <p>Loading receipt details...</p>;
    }

    if (!receipt) {
        return <p>Receipt not found.</p>;
    }

    return (
        // Use the 'dashboard' class as the main container
        <div className={styles.dashboard}>
            <h2 className={styles.header}>
                Receipt from {new Date(receipt.processed_date).toLocaleString()}
            </h2>

            <div className={styles.grid}>
                {/* Place each section into a 'card' */}
                <div className={styles.card}>
                    <CategoryPieChart receiptId={id} />
                </div>

                <div className={styles.card}>
                    <h3>Items:</h3>
                    <ul>
                        {receipt.items.map(item => (
                            <li key={item.item_name + item.price}>
                                <Link to={`/history/${item.item_name}`}>
                                    {item.item_name}
                                </Link>
                                : ₹{item.price} ({item.category})
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <Link to="/" className={styles.backLink}>Back to Dashboard</Link>
        </div>
    );
};

export default ReceiptDetailPage;