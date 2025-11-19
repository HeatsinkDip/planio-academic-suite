import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser && storedUser !== 'undefined') {
            try {
                setCurrentUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
                // Verify token is still valid
                authAPI.getProfile()
                    .then(data => {
                        setCurrentUser(data.user);
                        localStorage.setItem('user', JSON.stringify(data.user));
                    })
                    .catch(() => {
                        // Token invalid, clear auth
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setCurrentUser(null);
                        setIsAuthenticated(false);
                    })
                    .finally(() => setLoading(false));
            } catch (error) {
                // Invalid JSON, clear storage
                console.error('Error parsing user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setCurrentUser(null);
                setIsAuthenticated(false);
                setLoading(false);
            }
        } else {
            // Clear any invalid data
            if (storedUser === 'undefined' || token === 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            setLoading(false);
        }
    }, []);

    const signup = async ({ name, email, password }) => {
        try {
            const data = await authAPI.register({ name, email, password });
            
            // Store token and user
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Update state
            setCurrentUser(data.user);
            setIsAuthenticated(true);
            setLoading(false);
            
            return { success: true };
        } catch (error) {
            console.error('Signup error:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Registration failed. Please try again.' 
            };
        }
    };

    const login = async ({ email, password }) => {
        try {
            const data = await authAPI.login({ email, password });
            
            // Store token and user
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Update state
            setCurrentUser(data.user);
            setIsAuthenticated(true);
            setLoading(false);
            
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Invalid email or password' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    const updateProfile = async (updates) => {
        try {
            const updatedUser = { ...currentUser, ...updates };
            setCurrentUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to update profile' };
        }
    };

    const value = {
        currentUser,
        isAuthenticated,
        loading,
        signup,
        login,
        logout,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
