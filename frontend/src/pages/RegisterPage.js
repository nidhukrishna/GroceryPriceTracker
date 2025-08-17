import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import styles from './LoginPage.module.css';

const RegisterPage = () => {
  let { registerUser } = useContext(AuthContext);
  return (
     <div className={styles.container}>
            <h2>Register</h2>
            <form onSubmit={registerUser} className={styles.form}>
                <input type="text" name="username" placeholder="Enter Username" required />
                <input type="password" name="password" placeholder="Enter Password" required />
                <input type="password" name="password2" placeholder="Confirm Password" required />
                <button type="submit">Register</button>
            </form>
      </div>
  );
};

export default RegisterPage;