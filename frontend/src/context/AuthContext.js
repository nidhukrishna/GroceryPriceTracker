import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export default AuthContext;

export const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'production'
        ? 'https://grocerytracker.onrender.com'
        : 'http://127.0.0.1:8000');

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    const navigate = useNavigate();

    const logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    }, [navigate]);

    const loginUser = async (e) => {
        e.preventDefault();
        setAuthError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
                username: e.target.username.value.trim(),
                password: e.target.password.value,
            });
            const data = response.data;
            if (response.status === 200) {
                setAuthTokens(data);
                localStorage.setItem('authTokens', JSON.stringify(data));

                const userResponse = await axios.get(`${API_BASE_URL}/api/auth/user/`, {
                    headers: { Authorization: 'Bearer ' + String(data.access) },
                });
                setUser(userResponse.data);
                navigate('/');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setAuthError('Invalid username or password. Please try again.');
        }
    };

    const registerUser = async (e) => {
        e.preventDefault();
        setAuthError(null);
        const username = e.target.username.value.trim();
        const password = e.target.password.value;
        const password2 = e.target.password2.value;

        if (password !== password2) {
            setAuthError('Passwords do not match.');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/register/`, {
                username,
                password,
                password2,
            });
            if (response.status === 201) {
                // Automatically log the user in right after registration
                const loginRes = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
                    username,
                    password,
                });
                setAuthTokens(loginRes.data);
                localStorage.setItem('authTokens', JSON.stringify(loginRes.data));
                setUser({ username });
                navigate('/');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            const backendMsg =
                error.response?.data?.username?.[0] ||
                error.response?.data?.password?.[0] ||
                'Registration failed. Try a different username.';
            setAuthError(backendMsg);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            if (authTokens) {
                try {
                    const userResponse = await axios.get(`${API_BASE_URL}/api/auth/user/`, {
                        headers: { Authorization: 'Bearer ' + String(authTokens.access) },
                    });
                    setUser(userResponse.data);
                } catch (error) {
                    console.error('Token invalid, logging out:', error);
                    logoutUser();
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, [authTokens, logoutUser]);

    const contextData = {
        user,
        authTokens,
        authError,
        setAuthError,
        loginUser,
        registerUser,
        logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};