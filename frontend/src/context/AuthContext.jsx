import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

import API_URL from '../config/api';

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
                const res = await fetch(`${API_URL}/auth/me`, {
                    credentials: 'include'
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Login failed');
        }

        setUser(data);
        return data;
    }, []);

    const signup = useCallback(async (name, email, password) => {
        const res = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Signup failed');
        }

        setUser(data);
        return data;
    }, []);

    const logout = useCallback(async () => {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        setUser(null);
    }, []);

    const logoutAll = useCallback(async () => {
        await fetch(`${API_URL}/auth/logout-all`, {
            method: 'POST',
            credentials: 'include'
        });
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
