import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext, { API_BASE_URL } from '../context/AuthContext';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// The component now accepts props, specifically 'receiptId'
const CategoryPieChart = ({ receiptId }) => {
    const [chartData, setChartData] = useState({});
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const { authTokens } = useContext(AuthContext);


    useEffect(() => {
        // Determine the API endpoint based on whether a receiptId was provided
        const endpoint = receiptId 
            ? `${API_BASE_URL}/api/receipt/${receiptId}/` 
            : `${API_BASE_URL}/api/receipt/summary/`;

        setTitle(receiptId ? 'Spending for this Receipt' : 'Overall Spending Summary');

        const fetchData = async () => {
            try {
                const response = await axios.get(endpoint, {
                    headers: { 'Authorization': 'Bearer ' + String(authTokens.access) }
                });

                let labels, data;

                // Process the data differently based on the endpoint
                if (receiptId) {
                    // This is for a single receipt
                    const categoryTotals = response.data.items.reduce((acc, item) => {
                        acc[item.category] = (acc[item.category] || 0) + parseFloat(item.price);
                        return acc;
                    }, {});
                    labels = Object.keys(categoryTotals);
                    data = Object.values(categoryTotals);
                } else {
                    // This is for the overall summary
                    labels = response.data.map(item => item.category);
                    data = response.data.map(item => item.total_spent);
                }

                if (labels.length > 0) {
                    setChartData({
                        labels: labels,
                        datasets: [{
                            label: 'Amount Spent',
                            data: data,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)',
                                'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)',
                                'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'
                            ],
                            borderWidth: 1
                        }]
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching chart data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [authTokens, receiptId]); // Effect now re-runs if receiptId changes

    if (loading) {
        return <p>Loading chart...</p>;
    }

    return (
        <div>
            <h3>{title}</h3>
            <div style={{ maxWidth: '400px', margin: 'auto' }}>
                {chartData.labels && chartData.labels.length > 0 ? <Pie data={chartData} /> : <p>No data available to display.</p>}
            </div>
        </div>
    );
};

export default CategoryPieChart;