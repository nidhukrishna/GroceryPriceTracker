import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import styles from './LoginPage.module.css';

const LoginPage = () => {

    let { loginUser } = useContext(AuthContext);
  return (
    <div className={styles.container}>
      <h2>Login Page</h2>
      <form onSubmit={loginUser} className={styles.form}>
        <input type="text" name="username" placeholder="Enter Username" />
        <input type="password" name="password" placeholder="Enter Password" />
        <button type="Submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;