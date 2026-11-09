import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext, { API_BASE_URL } from '../context/AuthContext';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

const CategoryPieChart = ({ receiptId, refreshKey = 0 }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authTokens } = useContext(AuthContext);

  useEffect(() => {
    const endpoint = receiptId
      ? `${API_BASE_URL}/api/receipt/${receiptId}/`
      : `${API_BASE_URL}/api/receipt/summary/`;

    const fetchData = async () => {
      if (!authTokens) return;
      setLoading(true);
      try {
        const response = await axios.get(endpoint, {
          headers: { Authorization: 'Bearer ' + String(authTokens.access) },
        });

        let labels = [];
        let data = [];

        if (receiptId) {
          const categoryTotals = (response.data.items || []).reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + parseFloat(item.price);
            return acc;
          }, {});
          labels = Object.keys(categoryTotals);
          data = Object.values(categoryTotals);
        } else {
          labels = response.data.map((item) => item.category);
          data = response.data.map((item) => parseFloat(item.total_spent));
        }

        if (labels.length > 0) {
          setChartData({
            labels,
            datasets: [
              {
                label: 'Spent (₹)',
                data,
                backgroundColor: PALETTE.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff',
              },
            ],
          });
        } else {
          setChartData(null);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authTokens, receiptId, refreshKey]);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            {receiptId ? 'Receipt Breakdown' : 'Spending by Category'}
          </h3>
          <p className="card-subtitle">Where your money goes</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading chart...</div>
      ) : chartData ? (
        <div style={{ maxWidth: '340px', margin: '0.5rem auto' }}>
          <Doughnut
            data={chartData}
            options={{
              plugins: {
                legend: { position: 'bottom' },
              },
              cutout: '62%',
            }}
          />
        </div>
      ) : (
        <div className="empty-state">Upload a receipt to see your spending breakdown.</div>
      )}
    </div>
  );
};

export default CategoryPieChart;