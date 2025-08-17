import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ReceiptUpload from '../components/ReceiptUpload';
import ReceiptList from '../components/ReceiptList';
import CategoryPieChart from '../components/CategoryPieChart';
import TopItems from '../components/TopItems';
import styles from './HomePage.module.css';

const HomePage = () => {
    let { user, logoutUser } = useContext(AuthContext);

    return (
        <div>
            {user ? (
                // --- LOGGED-IN DASHBOARD VIEW ---
                <div className={styles.dashboard}>
                    <header className={styles.header}>
                        <h1>Hello, {user.username}!</h1>
                        <button onClick={logoutUser} className={styles.logoutButton}>Logout</button>
                    </header>

                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <CategoryPieChart />
                        </div>

                        <div className={styles.middleColumn}>
                          <div className={styles.card}>
                            <ReceiptUpload />
                          </div>
                          <div className={StyleSheet.card}>
                             <TopItems />
                          </div>
                        </div>
                        
                        <div className={styles.card}>
                            <ReceiptList />
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.loggedOutContainer}>
                    <h1>Grocery Receipt Tracker</h1>
                    <p>You are not logged in.</p>
                    <p>Please <Link to="/login" className={styles.link}>Login</Link> or <Link to="/register" className={styles.link}>Register</Link></p>
                </div>
            )}
        </div>
    );
};

export default HomePage;