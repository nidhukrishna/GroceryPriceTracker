import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LoginPage = () => {
  const { loginUser, authError, setAuthError } = useContext(AuthContext);

  useEffect(() => {
    setAuthError(null);
  }, [setAuthError]);

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your GrocTrack account</p>

        {authError && <div className="alert-error">{authError}</div>}

        <form onSubmit={loginUser}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Sign In
          </button>
        </form>

        <p style={{ marginTop: '1.25rem', fontSize: '0.88rem', color: '#64748b', textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#059669', fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;