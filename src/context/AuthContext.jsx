import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                // Check if user is logged in on mount
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');
                
                if (token && storedUser && storedUser !== 'undefined') {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        setCurrentUser(parsedUser);
                        setIsAuthenticated(true);
                        
                        // Verify token is still valid
                        try {
                            const data = await authAPI.getProfile();
                            // Backend returns user object directly or nested
                            const userData = data.user || data;
                            setCurrentUser(userData);
                            localStorage.setItem('user', JSON.stringify(userData));
                            console.log('✅ Authentication verified on page load:', userData);
                        } catch (verifyError) {
                            // Token invalid, clear auth
                            console.error('❌ Token verification failed:', verifyError);
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            setCurrentUser(null);
                            setIsAuthenticated(false);
                        }
                    } catch (parseError) {
                        // Invalid JSON, clear storage
                        console.error('Error parsing user data:', parseError);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setCurrentUser(null);
                        setIsAuthenticated(false);
                    }
                } else {
                    // Clear any invalid data
                    if (storedUser === 'undefined' || token === 'undefined') {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth verification error:', error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, []);

    const signup = async ({ name, email, password }) => {
        try {
            const data = await authAPI.register({ name, email, password });
            
            // Backend returns flat object: { _id, name, email, token }
            const { token, ...user } = data;
            
            // Store token and user
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Update state
            setCurrentUser(user);
            setIsAuthenticated(true);
            setLoading(false);
            
            console.log('✅ Signup successful:', user);
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
            
            // Backend returns flat object: { _id, name, email, token }
            const { token, ...user } = data;
            
            // Store token and user
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Update state
            setCurrentUser(user);
            setIsAuthenticated(true);
            setLoading(false);
            
            console.log('✅ Login successful:', user);
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
