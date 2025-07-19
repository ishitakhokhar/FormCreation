// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; // Make sure this path is correct for your Axios instance

// Create the context
const AuthContext = createContext();

// AuthProvider component to wrap your entire application
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Stores user data (id, username, role, etc.)
    const [loading, setLoading] = useState(true); // True while checking initial authentication status

    // Effect to run once on component mount to check for existing token
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                // Set default authorization header for all subsequent API requests
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    // Fetch user details from the backend using the token
                    const res = await api.get('/api/auth/me'); // Assuming you have a /api/auth/me endpoint
                    setUser(res.data); // Set user data (should include role)
                } catch (error) {
                    console.error('Failed to load user from token:', error);
                    // If token is invalid or expired, remove it and clear user state
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false); // Authentication check is complete
        };

        loadUser();
    }, []); // Empty dependency array ensures this runs only once on mount

    // Function to handle user login
    const login = async (email, password) => {
        const res = await api.post('/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token); // Store token in local storage
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user); // Assuming your login response returns user data
    };

    // Function to handle user logout
    const logout = () => {
        localStorage.removeItem('token'); // Remove token from local storage
        delete api.defaults.headers.common['Authorization']; // Remove header
        setUser(null); // Clear user state
    };

    // Provide the authentication state and functions to children components
    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily access authentication context in any component
export const useAuth = () => useContext(AuthContext);