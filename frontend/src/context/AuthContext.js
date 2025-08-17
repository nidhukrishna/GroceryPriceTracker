import { createContext, useState, useEffect, useCallback } from 'react'; // 1. Import useCallback
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    let [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    let [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const API_BASE_URL = 'https://grocerytracker.onrender.com';

    let loginUser = async (e) => {
        e.preventDefault();
        try {
            let response = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
                username: e.target.username.value,
                password: e.target.password.value,
            });
            let data = response.data;
            if (response.status === 200) {
                setAuthTokens(data);
                localStorage.setItem('authTokens', JSON.stringify(data));
                
                const userResponse = await axios.get(`${API_BASE_URL}/api/auth/user/`, {
                    headers: { 'Authorization': 'Bearer ' + String(data.access) }
                });
                setUser(userResponse.data);

                navigate('/');
            }
        } catch (error) {
            console.error("Login failed:", error);
            alert('Something went wrong! Please check your username and password.');
        }
    };

    // 2. Wrap logoutUser in useCallback
    let logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    }, [navigate]); // navigate is a dependency of logoutUser

    useEffect(() => {
        const fetchUser = async () => {
            if (authTokens) {
                try {
                    const userResponse = await axios.get(`${API_BASE_URL}/api/auth/user/`, {
                        headers: { 'Authorization': 'Bearer ' + String(authTokens.access) }
                    });
                    setUser(userResponse.data);
                } catch (error) {
                    console.error("Token invalid, logging out:", error);
                    logoutUser();
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, [authTokens, logoutUser]);

    let contextData = {
        user: user,
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};