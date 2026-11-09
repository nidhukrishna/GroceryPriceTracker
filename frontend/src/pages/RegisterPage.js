import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const RegisterPage = () => {
  const { registerUser, authError, setAuthError } = useContext(AuthContext);

  useEffect(() => {
    setAuthError(null);
  }, [setAuthError]);

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Create an account</h2>
        <p className="auth-subtitle">Start tracking your grocery receipts for free</p>

        {authError && <div className="alert-error">{authError}</div>}

        <form onSubmit={registerUser}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Choose a username"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Create a password"
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="password2"
              className="form-input"
              placeholder="Re-enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Create Account
          </button>
        </form>

        <p style={{ marginTop: '1.25rem', fontSize: '0.88rem', color: '#64748b', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#059669', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;