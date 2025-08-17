import { createContext, useState, useEffect } from 'react'; // Add useEffect here
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    let [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    // Initialize user state to null. We'll fetch it.
    let [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add a loading state

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

                // Fetch user details after login
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

    let logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    };

    // --- THIS IS THE NEW CODE ---
    // This useEffect runs once on the initial load to check if a user is logged in
    useEffect(() => {
        const fetchUser = async () => {
            if (authTokens) {
                try {
                    const userResponse = await axios.get(`${API_BASE_URL}/api/auth/user/`, {
                        headers: { 'Authorization': 'Bearer ' + String(authTokens.access) }
                    });
                    setUser(userResponse.data);
                } catch (error) {
                    // If token is invalid, log out the user
                    console.error("Token invalid, logging out:", error);
                    logoutUser();
                }
            }
            setLoading(false); // Set loading to false after checking
        };
        fetchUser();
    }, []); // The empty array means this effect runs only once on mount

    let contextData = {
        user: user,
        authTokens: authTokens, // Expose authTokens to context
        loginUser: loginUser,
        logoutUser: logoutUser,
    };

    // Render children only after the initial loading check is complete
    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};