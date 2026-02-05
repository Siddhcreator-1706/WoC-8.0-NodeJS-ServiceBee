import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';

const Profile = () => {
    const { user, logout, logoutAll } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        state: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    const [company, setCompany] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            city: user.city || '',
            state: user.state || ''
        }));

        if (user.role === 'provider') {
            fetchCompanyDetails();
        }
    }, [user, navigate]);

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

    // ... handle change functions ...

    // Render Update: Show Company Logo
    // Within the render, where we show the avatar/icon:

    // Replacing the Profile Render Logic

    // ...

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <div className="max-w-2xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 p-8 rounded-2xl border border-purple-500/20"
                >
                    <div className="flex items-center gap-4 mb-8">
                        {/* Avatar / Logo Section */}
                        <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center text-4xl border border-orange-500/30 overflow-hidden">
                            {user.role === 'provider' && company?.logo ? (
                                <img src={company.logo} alt="Company Logo" className="w-full h-full object-cover" />
                            ) : (
                                <span>{user.role === 'admin' ? '🛡️' : user.role === 'provider' ? '🛠️' : '👤'}</span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                            <div className="flex flex-col">
                                <span className="text-purple-400 capitalize bg-purple-500/10 px-3 py-1 rounded-full text-sm border border-purple-500/20 w-fit">
                                    {user.role === 'admin' ? 'Administrator' : user.role === 'provider' ? 'Service Provider' : 'User'}
                                </span>
                                {user.role === 'provider' && company && (
                                    <span className="text-gray-400 text-sm mt-1">{company.name}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Role Specific Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        {user.role === 'user' && (
                            <>
                                <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50 text-center">
                                    <div className="text-2xl font-bold text-orange-400">0</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Services Used</div>
                                </div>
                                <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50 text-center">
                                    <div className="text-2xl font-bold text-purple-400">0</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Active Bookings</div>
                                </div>
                                <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50 text-center">
                                    <div className="text-2xl font-bold text-green-400">0</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Reviews Given</div>
                                </div>
                            </>
                        )}
                        {user.role === 'provider' && (
                            <>
                                <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50 text-center">
                                    <div className="text-2xl font-bold text-orange-400">{company?.services?.length || 0}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Services Active</div>
                                </div>
                                <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50 text-center">
                                    <div className="text-2xl font-bold text-purple-400">--</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Total Jobs</div>
                                </div>
                                <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50 text-center">
                                    <div className="text-2xl font-bold text-green-400">--</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Client Rating</div>
                                </div>
                            </>
                        )}
                        {user.role === 'admin' && (
                            <>
                                <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50 text-center">
                                    <div className="text-2xl font-bold text-orange-400">--</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Total Users</div>
                                </div>
                                <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50 text-center">
                                    <div className="text-2xl font-bold text-purple-400">--</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Providers</div>
                                </div>
                                <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50 text-center">
                                    <div className="text-2xl font-bold text-green-400">--</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">System Health</div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {message.text && (
                            <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {message.text}
                            </div>
                        )}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm mb-1">Name <span className="text-red-400">*</span></label>
                                <input
                                    type="text" name="name" value={formData.name} onChange={handleChange}
                                    className="w-full p-3 bg-gray-700/80 rounded-lg text-white border border-gray-600 focus:border-orange-500 outline-none transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm mb-1">Email <span className="text-red-400">*</span></label>
                                <input
                                    type="email" name="email" value={formData.email} onChange={handleChange}
                                    className="w-full p-3 bg-gray-700/80 rounded-lg text-white border border-gray-600 focus:border-orange-500 outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm mb-1">Phone</label>
                                <input
                                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                    className="w-full p-3 bg-gray-700/80 rounded-lg text-white border border-gray-600 focus:border-orange-500 outline-none transition-colors placeholder-gray-500"
                                    placeholder={formData.phone ? "" : "N/A"}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-gray-300 text-sm mb-1">City</label>
                                    <input
                                        type="text" name="city" value={formData.city} onChange={handleChange}
                                        className="w-full p-3 bg-gray-700/80 rounded-lg text-white border border-gray-600 focus:border-orange-500 outline-none transition-colors placeholder-gray-500"
                                        placeholder={formData.city ? "" : "N/A"}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 text-sm mb-1">State</label>
                                    <input
                                        type="text" name="state" value={formData.state} onChange={handleChange}
                                        className="w-full p-3 bg-gray-700/80 rounded-lg text-white border border-gray-600 focus:border-orange-500 outline-none transition-colors placeholder-gray-500"
                                        placeholder={formData.state ? "" : "N/A"}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
                        >
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </form>

                    {/* Change Password Section */}
                    <div className="mt-8 border-t border-purple-500/20 pt-6">
                        <button
                            onClick={() => setShowPasswordSection(!showPasswordSection)}
                            className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors font-medium"
                        >
                            <svg className={`w-5 h-5 transition-transform ${showPasswordSection ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Change Password
                        </button>

                        {showPasswordSection && (
                            <motion.form
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onSubmit={handlePasswordSubmit}
                                className="mt-4 p-6 bg-gray-800 rounded-2xl border border-gray-700 shadow-xl space-y-4"
                            >
                                <div>
                                    <label className="block text-gray-300 text-sm mb-1">Current Password</label>
                                    <input
                                        type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange}
                                        className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-600 focus:border-orange-500 outline-none transition-colors"
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 text-sm mb-1">New Password</label>
                                        <input
                                            type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange}
                                            className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-600 focus:border-orange-500 outline-none transition-colors"
                                            placeholder="Min 6 characters"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 text-sm mb-1">Confirm New Password</label>
                                        <input
                                            type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange}
                                            className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-600 focus:border-orange-500 outline-none transition-colors"
                                            placeholder="Confirm password"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </motion.form>
                        )}
                    </div>

                    {/* Logout Actions */}
                    <div className="mt-8 border-t border-purple-500/20 pt-6">
                        <button
                            onClick={handleLogoutAll}
                            className="w-full py-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20 font-medium flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout from All Devices
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
