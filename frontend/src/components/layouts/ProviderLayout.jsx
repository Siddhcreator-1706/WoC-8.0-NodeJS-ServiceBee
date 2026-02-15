import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import API_URL from '../../config/api';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from '../common/ChatWidget';

const ProviderLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f13] text-white flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-[#0f0f13] to-[#0f0f13]" />
                <div className="text-orange-500 text-xl font-bold animate-pulse relative z-10 font-creepster tracking-widest flex flex-col items-center gap-4">
                    <span className="text-4xl">🎃</span>
                    Summoning Dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-gray-100 font-sans selection:bg-orange-500/30 selection:text-orange-200">
            <Navbar />
            <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full"
                    >
                        <Outlet context={{ company, refreshCompany: fetchCompany }} />
                    </motion.div>
                </AnimatePresence>
            </main>
            <Footer />
            <ChatWidget />
        </div>
    );
};

export default ProviderLayout;
