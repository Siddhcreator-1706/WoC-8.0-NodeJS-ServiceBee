import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import API_URL from '../../config/api';

const ProviderLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { path: 'profile', label: 'Profile', icon: '📊' },
        { path: 'services', label: 'My Services', icon: '📦' },
        { path: 'bookings', label: 'Bookings', icon: '📅' },
        { path: 'complaints', label: 'Complaints', icon: '📢' },
    ];

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/companies/me`);
            setCompany(res.data);
        } catch (err) {
            console.error('No company found:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f13] text-white flex items-center justify-center relative overflow-hidden">
                <div className="text-orange-500 text-xl font-bold animate-pulse relative z-10 font-creepster tracking-widest">
                    Summoning Dashboard...
                </div>
            </div>
        );
    }

    // Redirect to registration if no company (handled via Route in App.jsx usually, but good fallback)
    // Actually, we'll let the sub-components handle empty states or the layout can render a registration prompt if we want.
    // But for this refactor, we are assuming standard navigation.
    // Check if we should show the registration page instead?
    // Let's assume we use a separate route for registration or handle it in the Overview if missing.

    // If no company, we might want to restrict access to other tabs.
    // For now, let's just render the layout.

    return (
        <div className="min-h-screen bg-[#0f0f13] text-gray-100 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Main Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Pass outlet context if needed, e.g., company data */}
                        <Outlet context={{ company, refreshCompany: fetchCompany }} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProviderLayout;
