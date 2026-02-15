import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';
import CustomSelect from '../components/ui/CustomSelect'; // Added import
import useLocationData from '../hooks/useLocationData'; // Added import

const Profile = () => {
    const { user, logout, logoutAll, updateUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        state: ''
    });

    // Use custom hook for location data
    const { statesList: stateOptions, districtsList: districtOptions, loadingStates, loadingDistricts } = useLocationData(formData.state);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Toggle state

    const [company, setCompany] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [reviewCount, setReviewCount] = useState(0);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                city: user.city || '',
                state: user.state || ''
            }));

            const fetchData = () => {
                if (user.role === 'provider') {
                    fetchCompanyDetails();
                } else if (user.role === 'user') {
                    fetchBookings();
                    fetchReviewCount();
                }
            };

            fetchData();
            // Poll every 30 seconds for updates
            const interval = setInterval(fetchData, 30000);
            return () => clearInterval(interval);
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    // Auto-dismiss messages
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchReviewCount = async () => {
        try {
            const res = await fetch(`${API_URL}/api/services/my-reviews`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setReviewCount(Array.isArray(data) ? data.length : 0);
            }
        } catch (error) {
            console.error('Failed to fetch review count');
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/bookings/my-bookings`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                // API returns { bookings: [...], page, pages, total }
                setBookings(Array.isArray(data) ? data : data.bookings || []);
            }
        } catch (error) {
            console.error('Failed to fetch bookings');
        }
    };

    const fetchCompanyDetails = async () => {
        try {
            const res = await fetch(`${API_URL}/api/companies/me`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setCompany(data);
            }
        } catch (error) {
            console.error('Failed to fetch company details');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setLoading(true);

        try {
            const res = await axios.put(`${API_URL}/api/users/profile`, formData);
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            updateUser(res.data);
            setIsEditing(false);
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ text: 'Passwords do not match', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            await axios.put(`${API_URL}/api/users/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ text: 'Password updated successfully!', type: 'success' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordSection(false);
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Password update failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutAll = async () => {
        try {
            await logoutAll();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const activeTab = tabParam || 'profile';

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0f0f13] font-sans text-gray-100 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0f0f13] to-[#0f0f13]" />
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-orange-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#15151e]/80 backdrop-blur-md p-4 md:p-8 rounded-2xl border border-gray-800 shadow-2xl relative"
                >
                    {/* Spooky Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-6 md:mb-8 relative z-10 border-b border-gray-800 pb-4 md:pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 md:w-20 md:h-20 bg-[#0a0a0f] rounded-full flex items-center justify-center text-2xl md:text-4xl border border-gray-700 shadow-lg overflow-hidden relative group flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                {user.role === 'provider' && company?.logo ? (
                                    <img src={company.logo} alt="Company Logo" className="w-full h-full object-cover" />
                                ) : (user.role === 'user' && user?.avatar && user.avatar.startsWith('http') ? (
                                    <img src={user.avatar} alt="User Profile Picture" className="w-full h-full object-cover" />
                                ) : (<span>{user.role === 'admin' ? '🛡️' : user.role === 'provider' ? '🛠️' : '👤'}</span>))}
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 font-creepster tracking-wide drop-shadow-[0_2px_4px_rgba(255,165,0,0.3)]">{user.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-purple-400 capitalize bg-purple-500/10 px-3 py-0.5 rounded-full text-xs font-bold border border-purple-500/20">
                                        {user.role === 'admin' ? 'Administrator' : user.role === 'provider' ? 'Service Provider' : 'Mystical Member'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-sm md:text-base transition-all ${isEditing
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg shadow-orange-900/20'}`}
                        >
                            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                        </button>
                    </div>

                    <AnimatePresence>
                        {message.text && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Profile Stats (Visible in both modes) */}
                    {activeTab === 'profile' && !isEditing && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                            {/* Services Used - Large Card */}
                            <div className="col-span-2 md:col-span-2 bg-gradient-to-br from-[#0a0a0f] to-[#15151e] p-4 md:p-6 rounded-2xl border border-gray-800 flex flex-col justify-between relative overflow-hidden group hover:border-orange-500/30 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="text-4xl md:text-6xl">🔮</span>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Services Used</div>
                                    <div className="text-2xl md:text-4xl font-bold text-white group-hover:text-orange-400 transition-colors">
                                        {new Set(bookings.filter(b => b.status === 'completed').map(b => b.service?._id)).size}
                                    </div>
                                </div>
                            </div>

                            {/* Active Bookings */}
                            <div className="col-span-1 bg-[#0a0a0f]/50 p-3 md:p-4 rounded-2xl border border-gray-800 flex flex-col justify-center items-center text-center hover:border-purple-500/50 transition-all hover:bg-[#0a0a0f] group">
                                <div className="text-2xl md:text-3xl mb-1 md:mb-2 group-hover:scale-110 transition-transform">👻</div>
                                <div className="text-xl md:text-2xl font-bold text-white">
                                    {bookings.filter(b => ['pending', 'accepted'].includes(b.status)).length}
                                </div>
                                <div className="text-[10px] text-purple-300 uppercase tracking-wider mt-1">Active Bookings</div>
                            </div>

                            {/* Reviews Given */}
                            <div className="col-span-1 bg-[#0a0a0f]/50 p-3 md:p-4 rounded-2xl border border-gray-800 flex flex-col justify-center items-center text-center hover:border-green-500/50 transition-all hover:bg-[#0a0a0f] group">
                                <div className="text-2xl md:text-3xl mb-1 md:mb-2 group-hover:scale-110 transition-transform">⭐</div>
                                <div className="text-xl md:text-2xl font-bold text-white">
                                    {reviewCount}
                                </div>
                                <div className="text-[10px] text-green-300 uppercase tracking-wider mt-1">Reviews Given</div>
                            </div>
                        </div>
                    )}

                    {/* Content Section */}
                    {activeTab === 'profile' && (
                        <div className="relative z-10">
                            {isEditing ? (
                                <motion.form
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-1">Full Name <span className="text-red-400">*</span></label>
                                            <input
                                                type="text" name="name" value={formData.name} onChange={handleChange}
                                                className="w-full p-2.5 md:p-3 bg-[#0a0a0f] rounded-lg text-sm md:text-base text-white border border-gray-700 focus:border-orange-500 outline-none transition-colors"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-1">Email Address <span className="text-red-400">*</span></label>
                                            <input
                                                type="email" name="email" value={formData.email} onChange={handleChange}
                                                className="w-full p-2.5 md:p-3 bg-[#0a0a0f] rounded-lg text-sm md:text-base text-white border border-gray-700 focus:border-orange-500 outline-none transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-1">Phone Number</label>
                                            <input
                                                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                                className="w-full p-2.5 md:p-3 bg-[#0a0a0f] rounded-lg text-sm md:text-base text-white border border-gray-700 focus:border-orange-500 outline-none transition-colors placeholder-gray-600"
                                                placeholder="+91..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <CustomSelect
                                                    label="State"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, state: e.target.value, city: '' }));
                                                    }}
                                                    options={stateOptions}
                                                    loading={loadingStates}
                                                    placeholder="Select State"
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <CustomSelect
                                                    label="City"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    options={districtOptions}
                                                    loading={loadingDistricts}
                                                    disabled={!formData.state}
                                                    placeholder={formData.state ? "Select City" : "Select state first"}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-800 pt-6 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordSection(!showPasswordSection)}
                                            className="text-orange-400 hover:text-orange-300 transition-colors font-medium flex items-center gap-2 mb-4"
                                        >
                                            <svg className={`w-5 h-5 transition-transform ${showPasswordSection ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            Change Password
                                        </button>

                                        <AnimatePresence>
                                            {showPasswordSection && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-4 md:p-6 bg-[#0a0a0f] rounded-xl border border-gray-800 space-y-4 mb-6">
                                                        <div>
                                                            <label className="block text-gray-400 text-sm mb-1">Current Password</label>
                                                            <input
                                                                type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange}
                                                                className="w-full p-3 bg-[#15151e] rounded-lg text-white border border-gray-700 focus:border-orange-500 outline-none"
                                                                placeholder="Required to set new password"
                                                            />
                                                        </div>
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-gray-400 text-sm mb-1">New Password</label>
                                                                <input
                                                                    type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange}
                                                                    className="w-full p-3 bg-[#15151e] rounded-lg text-white border border-gray-700 focus:border-orange-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-gray-400 text-sm mb-1">Confirm New Password</label>
                                                                <input
                                                                    type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange}
                                                                    className="w-full p-3 bg-[#15151e] rounded-lg text-white border border-gray-700 focus:border-orange-500 outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={handlePasswordSubmit}
                                                            type="button"
                                                            className="w-full py-3 bg-purple-600/20 text-purple-400 border border-purple-600/30 hover:bg-purple-600/30 rounded-lg font-semibold transition-all"
                                                        >
                                                            Update Password Only
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 md:gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base text-gray-400 hover:text-white font-medium hover:bg-gray-800 transition-colors text-center"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 md:px-8 py-2.5 md:py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm md:text-base font-bold rounded-lg hover:from-orange-500 hover:to-red-500 transition-all shadow-lg shadow-orange-900/40 disabled:opacity-50"
                                        >
                                            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                                        </button>
                                    </div>
                                </motion.form>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-8"
                                >
                                    {/* Read-Only Details */}
                                    <div className="grid md:grid-cols-2 gap-4 md:gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2.5 md:gap-3 text-gray-300 bg-[#0a0a0f] p-3 md:p-4 rounded-xl border border-gray-800">
                                                <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-800 flex items-center justify-center text-base md:text-xl flex-shrink-0">📧</span>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email Address</div>
                                                    <div className="text-white font-medium text-sm md:text-base break-all">{formData.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5 md:gap-3 text-gray-300 bg-[#0a0a0f] p-3 md:p-4 rounded-xl border border-gray-800">
                                                <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-800 flex items-center justify-center text-base md:text-xl flex-shrink-0">📞</span>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Phone Number</div>
                                                    <div className="text-white font-medium text-sm md:text-base">{formData.phone || 'Not Provided'}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2.5 md:gap-3 text-gray-300 bg-[#0a0a0f] p-3 md:p-4 rounded-xl border border-gray-800">
                                                <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-800 flex items-center justify-center text-base md:text-xl flex-shrink-0">🏙️</span>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">City</div>
                                                    <div className="text-white font-medium text-sm md:text-base">{formData.city || 'Not Provided'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5 md:gap-3 text-gray-300 bg-[#0a0a0f] p-3 md:p-4 rounded-xl border border-gray-800">
                                                <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-800 flex items-center justify-center text-base md:text-xl flex-shrink-0">🗺️</span>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">State</div>
                                                    <div className="text-white font-medium text-sm md:text-base">{formData.state || 'Not Provided'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logout Actions */}
                                    <div className="mt-6 md:mt-8 border-t border-gray-800 pt-6 md:pt-8">
                                        <button
                                            onClick={handleLogoutAll}
                                            className="w-full py-3 md:py-4 bg-red-500/5 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors border border-red-500/10 font-bold flex items-center justify-center gap-2 group tracking-wide uppercase text-xs md:text-sm"
                                        >
                                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Sign Out From All Devices
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
