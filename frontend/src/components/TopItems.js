import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const TopItems = () => {
    const [topItems, setTopItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { authTokens } = useContext(AuthContext);
    const API_BASE_URL = 'http://127.0.0.1:8000';

    useEffect(() => {
        const fetchTopItems = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/receipt/top-items/`, {
                    headers: { 'Authorization': 'Bearer ' + String(authTokens.access) }
                });
                setTopItems(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching top items:", error);
                setLoading(false);
            }
        };
        fetchTopItems();
    }, [authTokens]);

    if (loading) {
        return <p>Loading top items...</p>;
    }

    return (
        <div>
            <h3>Your Most Frequent Items</h3>
            {topItems.length > 0 ? (
                <ol style={{ paddingLeft: '20px' }}>
                    {topItems.map((item, index) => (
                        <li key={index} style={{ marginBottom: '8px' }}>
                            {item.item_name} ({item.item_count} times)
                        </li>
                    ))}
                </ol>
            ) : (
                <p>No items purchased yet.</p>
            )}
        </div>
    );
};

export default TopItems;