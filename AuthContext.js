import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
const AuthContext = createContext(null);
const AUTH_API_URL = 'http://localhost:5000/api/auth'; 
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (e) {
                console.error("Failed to parse user from localStorage:", e);
                localStorage.removeItem('user'); 
            }
        }
        setLoading(false); 
    }, []);
    const login = async (username, password) => {
        try {
            setLoading(true);
            const response = await axios.post(`${AUTH_API_URL}/login`, { username, password });
            const userData = response.data; 

            localStorage.setItem('user', JSON.stringify(userData)); 
            setUser(userData); 
            setLoading(false);
            return userData; 
        } catch (error) {
            setLoading(false);
            console.error('Login failed:', error.response?.data || error.message);
            throw error; 
        }
    };
    const register = async (username, password, role) => {
        try {
            setLoading(true);
            const response = await axios.post(`${AUTH_API_URL}/register`, { username, password, role });
            const userData = response.data;
            setLoading(false);
            return userData;
        } catch (error) {
            setLoading(false);
            console.error('Registration failed:', error.response?.data || error.message);
            throw error;
        }
    };
    const logout = () => {
        localStorage.removeItem('user'); 
        setUser(null); 
    };
    const authContextValue = {
        user,
        isAuthenticated: !!user, 
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {}
            {!loading && children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
