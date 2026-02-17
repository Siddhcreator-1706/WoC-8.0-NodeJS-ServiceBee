import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';


const AuthContext = createContext(null);

// AuthProvider component - the only export from this file for Fast Refresh
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const isLoggedIn = document.cookie.split(';').some(c => c.trim().startsWith('logged_in='));

            if (!isLoggedIn) {
                setLoading(false);
                return;
            }

            try {
                // Axios uses withCredentials=true from global config
                const res = await axios.get('/auth/me');
                setUser(res.data);
            } catch (error) {
                setUser(null);
                // Clear marker cookie if session invalid
                document.cookie = "logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            const res = await axios.post('/auth/login', { email, password });
            setUser(res.data);
            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    }, []);

    const signup = useCallback(async (userData) => {
        try {
            const res = await axios.post('/auth/signup', userData);
            // Note: Signup might not return a user immediately if verification is needed (OTP)
            // But if it does, we set it.
            if (res.data && res.data.token) {
                setUser(res.data);
            }
            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Signup failed');
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await axios.post('/auth/logout');
        } catch (error) {
            console.error(error);
        }
        setUser(null);
    }, []);

    const logoutAll = useCallback(async () => {
        try {
            await axios.post('/auth/logout-all');
        } catch (error) {
            console.error(error);
        }
        setUser(null);
    }, []);

    const updateUser = useCallback((userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, logoutAll, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook - exported as function declaration
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
