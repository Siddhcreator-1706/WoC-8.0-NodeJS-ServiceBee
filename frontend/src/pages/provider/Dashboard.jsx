import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config/api';
import ImageUpload from '../../components/ImageUpload';

// Import newly extracted components
import ProviderProfile from '../../components/provider/ProviderProfile';
import ServiceList from '../../components/provider/ServiceList';
import BookingList from '../../components/provider/BookingList';
import ComplaintList from '../../components/provider/ComplaintList';

// Provider Dashboard Component
const Dashboard = () => {
    const { user, logout, logoutAll } = useAuth();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');

    // activeTab initial state is derived from URL, defaulting to 'profile'
    const [activeTab, setActiveTab] = useState(tabParam || 'profile');

    // Registration form state (for new providers)
    const [companyForm, setCompanyForm] = useState({
        name: '', description: '', email: '', phone: '', website: '',
        address: { street: '', city: '', state: '', zipCode: '' }
    });
    const [logo, setLogo] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Sync state with URL changes
    useEffect(() => {
        if (tabParam && ['profile', 'services', 'bookings', 'complaints'].includes(tabParam)) {
            setActiveTab(tabParam);
        } else if (!tabParam) {
            setActiveTab('profile'); // Default to profile if no tab specified
        }
    }, [tabParam]);

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/companies/me`);
            setCompany(res.data);
            // Pre-fill form if data exists but state was null (obscure case) or just for consistency
            // Note: res.data is the company object
        } catch (err) {
            console.error('No company found:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', companyForm.name);
            formData.append('description', companyForm.description);
            formData.append('email', companyForm.email);
            formData.append('phone', companyForm.phone);
            formData.append('address', JSON.stringify(companyForm.address));

            if (logo.length > 0) {
                const file = logo[0];
                if (file instanceof File) {
                    formData.append('logo', file);
                }
            }

            const res = await axios.post(`${API_URL}/api/companies`, formData);

            setCompany(res.data);
            setMessage('Company registered successfully!');
            fetchCompany();
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    // Render logic
    if (loading || (user?.company && !company)) {
        return (
            <div className="min-h-screen bg-[#0f0f13] text-white flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-orange-900/20 rounded-full blur-[100px] opacity-30" />
                </div>
                <div className="text-orange-500 text-xl font-bold animate-pulse relative z-10 font-creepster tracking-widest">
                    Summoning Dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f13] text-gray-100 font-sans relative overflow-hidden pt-24">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0f0f13] to-[#0f0f13]" />
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-orange-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto p-6 relative z-10 ">
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 backdrop-blur-md">
                            ⚠️ {error}
                        </motion.div>
                    )}
                    {message && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl mb-6 backdrop-blur-md">
                            ✨ {message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {!company && !user.company ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
                        <div className="bg-[#15151e]/80 backdrop-blur-md rounded-2xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
                            <h2 className="text-2xl font-bold mb-6 text-center text-white font-creepster tracking-wide">Register Your Coven</h2>
                            <form onSubmit={handleRegisterSubmit} className="space-y-4 relative z-10">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                                    <input type="text" required value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                                    <textarea value={companyForm.description} onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" rows="3"></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Business Email</label>
                                        <input type="email" required value={companyForm.email} onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Phone</label>
                                        <input type="text" value={companyForm.phone} onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <ImageUpload
                                        label="Company Logo"
                                        maxImages={1}
                                        existingImages={logo}
                                        onImagesChange={setLogo}
                                    />
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <input type="checkbox" required id="terms" className="accent-orange-500 w-4 h-4" />
                                    <label htmlFor="terms" className="text-sm text-gray-400">
                                        I agree to the <Link to="/terms" target="_blank" className="text-orange-400 hover:underline">Terms & Conditions</Link>
                                    </label>
                                </div>
                                <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-orange-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                                    {submitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : 'Register As Provider'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Profile/Overview Content */}
                        {activeTab === 'profile' && (
                            <>
                                <ProviderProfile company={company} onUpdate={fetchCompany} />
                                {/* Logout Button (User Profile Style) */}
                                <div className="mt-8 border-t border-gray-800 pt-8 max-w-4xl mx-auto">
                                    <button
                                        onClick={logoutAll}
                                        className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20 font-medium flex items-center justify-center gap-2 group"
                                    >
                                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Logout from All Devices
                                    </button>
                                </div>
                            </>
                        )}

                        {activeTab === 'services' && (
                            <ServiceList services={company.services || []} onUpdate={fetchCompany} />
                        )}

                        {activeTab === 'bookings' && (
                            <BookingList />
                        )}

                        {activeTab === 'complaints' && (
                            <ComplaintList />
                        )}
                    </motion.div>
                )}
            </div>
        </div >
    );
};

export default Dashboard;
