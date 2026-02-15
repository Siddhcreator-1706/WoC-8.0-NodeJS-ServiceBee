import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '../common/ImageUpload';
import axios from 'axios';
import API_URL from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const ProviderProfile = ({ company, onUpdate }) => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Company Form State
    const [logo, setLogo] = useState([]);
    const [companyForm, setCompanyForm] = useState({
        name: '', description: '', email: '', phone: '', website: '',
        address: { street: '', city: '', state: '', zipCode: '' }
    });

    // Account Form State (User Data)
    const [userForm, setUserForm] = useState({
        name: '', email: '', phone: '', currentPassword: '', newPassword: '', confirmPassword: ''
    });

    useEffect(() => {
        if (company) {
            setCompanyForm({
                name: company.name,
                description: company.description,
                email: company.email,
                phone: company.phone,
                website: company.website || '',
                address: company.address || { street: '', city: '', state: '', zipCode: '' }
            });
            if (company.logo) {
                setLogo([{ preview: company.logo }]);
            }
        }
        if (user) {
            setUserForm(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [company, user]);

    // Auto-dismiss messages
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleSubmitAll = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setSubmitting(true);

        const errors = [];
        let successCount = 0;

        try {
            // 1. Update Company Profile
            const formData = new FormData();
            formData.append('name', companyForm.name);
            formData.append('description', companyForm.description);
            formData.append('email', userForm.email);
            formData.append('phone', userForm.phone);
            formData.append('website', companyForm.website);
            formData.append('address', JSON.stringify(companyForm.address));

            if (logo.length > 0 && logo[0] instanceof File) {
                formData.append('logo', logo[0]);
            }

            if (company?._id) {
                try {
                    await axios.put(`/api/companies/${company._id}`, formData);
                    successCount++;
                } catch (err) {
                    errors.push(`Company Update Failed: ${err.response?.data?.message || err.message}`);
                }
            }

            // 2. Update Account Profile
            try {
                const profileRes = await axios.put(`${API_URL}/api/users/profile`, {
                    name: userForm.name,
                    email: userForm.email,
                    phone: userForm.phone
                });
                updateUser(profileRes.data);
                successCount++;
            } catch (err) {
                errors.push(`Account Update Failed: ${err.response?.data?.message || err.message}`);
            }

            // 3. Update Password (if provided)
            if (userForm.newPassword) {
                if (userForm.newPassword !== userForm.confirmPassword) {
                    errors.push("Password Update Failed: New passwords do not match");
                } else {
                    try {
                        await axios.put(`${API_URL}/api/users/password`, {
                            currentPassword: userForm.currentPassword,
                            newPassword: userForm.newPassword
                        });
                        successCount++;
                    } catch (err) {
                        errors.push(`Password Update Failed: ${err.response?.data?.message || err.message}`);
                    }
                }
            }

            if (errors.length > 0) {
                setMessage({ text: errors.join('. '), type: 'error' });
            } else {
                setMessage({ text: 'All changes saved successfully! ✨', type: 'success' });
                setIsEditing(false);
                setUserForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
                if (onUpdate) onUpdate();
            }

        } catch (err) {
            setMessage({ text: 'An unexpected error occurred.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!company) return null;

    // Stats Data (New)
    const stats = [
        { label: 'Avg Rating', value: company.stats?.overallRating || '0.0', icon: '⭐', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
        { label: 'Bookings Done', value: company.stats?.completedBookings || 0, icon: '✅', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        { label: 'Active Services', value: company.services?.length || 0, icon: '⚡', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { label: 'Total Reviews', value: company.stats?.totalReviews || 0, icon: '💬', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    ];

    return (
        <div className="relative min-h-[80vh]">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-orange-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto space-y-6">

                {/* 1. Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#15151e]/80 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6"
                >
                    {/* Spooky Texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-[#0a0a0f] rounded-full flex items-center justify-center text-4xl border-2 border-gray-700 shadow-lg overflow-hidden relative group">
                            {logo[0]?.preview ? (
                                <img src={logo[0].preview} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <span>🏗️</span>
                            )}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <ImageUpload
                                        label="📷"
                                        maxImages={1}
                                        existingImages={logo}
                                        onImagesChange={setLogo}
                                        className="absolute inset-0 opacity-0 cursor-pointer" // Hack to make whole area clickable if ImageUpload supports it, otherwise rely on the component
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 font-creepster tracking-wider drop-shadow-sm">
                                {companyForm.name || 'Your Company'}
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${company.isVerified ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                    {company.isVerified ? 'Verified Provider' : 'Pending Verification'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg text-sm md:text-base flex items-center gap-2 ${isEditing
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 shadow-orange-900/30'}`}
                        >
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </button>
                    </div>
                </motion.div>

                {/* 2. Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-4 rounded-xl border ${stat.border} ${stat.bg} backdrop-blur-sm flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform`}
                        >
                            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{stat.icon}</span>
                            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                        >
                            <span className="text-xl">{message.type === 'success' ? '🎉' : '⚠️'}</span>
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. Content Area */}
                <form onSubmit={handleSubmitAll}>
                    <div className="grid md:grid-cols-3 gap-6">

                        {/* LEFT COLUMN: Company Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="md:col-span-2 space-y-6"
                        >
                            <div className="bg-[#15151e]/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800">
                                <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                                    <span className="text-orange-500">🏢</span> Company Details
                                </h3>

                                <div className="space-y-4">
                                    {isEditing ? (
                                        <>
                                            <div className="bg-[#0a0a0f] p-4 rounded-xl border border-gray-800 mb-4">
                                                <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Company Logo</label>
                                                <ImageUpload
                                                    maxImages={1}
                                                    existingImages={logo}
                                                    onImagesChange={setLogo}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-500 text-xs uppercase font-bold mb-1">Company Name</label>
                                                <input
                                                    type="text"
                                                    value={companyForm.name}
                                                    onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                                                    className="w-full bg-[#0a0a0f] border border-gray-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-500 text-xs uppercase font-bold mb-1">Description</label>
                                                <textarea
                                                    value={companyForm.description}
                                                    onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })}
                                                    className="w-full bg-[#0a0a0f] border border-gray-800 rounded-lg p-3 text-white h-32 focus:border-orange-500 outline-none transition-colors resize-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-500 text-xs uppercase font-bold mb-1">Website</label>
                                                <input
                                                    type="url"
                                                    value={companyForm.website}
                                                    onChange={e => setCompanyForm({ ...companyForm, website: e.target.value })}
                                                    className="w-full bg-[#0a0a0f] border border-gray-800 rounded-lg p-3 text-blue-400 focus:border-orange-500 outline-none transition-colors"
                                                    placeholder="https://"
                                                />
                                            </div>

                                            <div className="p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/10 text-xs text-yellow-500/70 italic">
                                                Note: Contact details (Email/Phone) are managed via your Account Settings.
                                            </div>
                                        </>
                                    ) : (
                                        /* READ ONLY VIEW FOR COMPANY */
                                        <div className="space-y-4">
                                            <div className="bg-[#0a0a0f] p-4 rounded-xl border border-gray-800">
                                                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">About</div>
                                                <p className="text-gray-300 leading-relaxed text-sm">{company.description || 'No description provided.'}</p>
                                            </div>

                                            {company.website && (
                                                <div className="flex items-center gap-3 bg-[#0a0a0f] p-4 rounded-xl border border-gray-800">
                                                    <span className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl">🌐</span>
                                                    <div>
                                                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Website</div>
                                                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-sm truncate block">
                                                            {company.website}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3 bg-[#0a0a0f] p-4 rounded-xl border border-gray-800">
                                                <span className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl">📍</span>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Location</div>
                                                    <div className="text-white font-medium text-sm">
                                                        {[company.address?.city, company.address?.state].filter(Boolean).join(', ') || 'Location not set'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* RIGHT COLUMN: Account Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-[#15151e]/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 h-full">
                                <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                                    <span className="text-purple-500">👤</span> Account & Contact
                                </h3>

                                <div className="space-y-4">
                                    {isEditing ? (
                                        <>
                                            <div>
                                                <label className="block text-gray-500 text-xs uppercase font-bold mb-1">Your Name</label>
                                                <input
                                                    type="text"
                                                    value={userForm.name}
                                                    onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                                                    className="w-full bg-[#0a0a0f] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-500 text-xs uppercase font-bold mb-1">Login Email</label>
                                                <input
                                                    type="email"
                                                    value={userForm.email}
                                                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                                    className="w-full bg-[#0a0a0f] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-500 text-xs uppercase font-bold mb-1">Phone Number</label>
                                                <input
                                                    type="text"
                                                    value={userForm.phone}
                                                    onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                                                    className="w-full bg-[#0a0a0f] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors"
                                                />
                                            </div>

                                            <div className="pt-4 border-t border-gray-800 mt-4">
                                                <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">🔒 Change Password</h4>
                                                <div className="space-y-3">
                                                    <input
                                                        type="password"
                                                        placeholder="Current Password (Required)"
                                                        value={userForm.currentPassword}
                                                        onChange={e => setUserForm({ ...userForm, currentPassword: e.target.value })}
                                                        className="w-full bg-[#0a0a0f] border border-gray-800 rounded-lg p-3 text-white focus:border-red-500 outline-none transition-colors text-sm"
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder="New Password"
                                                        value={userForm.newPassword}
                                                        onChange={e => setUserForm({ ...userForm, newPassword: e.target.value })}
                                                        className="w-full bg-[#0a0a0f] border border-gray-800 rounded-lg p-3 text-white focus:border-red-500 outline-none transition-colors text-sm"
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder="Confirm New Password"
                                                        value={userForm.confirmPassword}
                                                        onChange={e => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                                                        className="w-full bg-[#0a0a0f] border border-gray-800 rounded-lg p-3 text-white focus:border-red-500 outline-none transition-colors text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        /* READ ONLY VIEW FOR ACCOUNT */
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 bg-[#0a0a0f] p-4 rounded-xl border border-gray-800">
                                                <span className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">👤</span>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Name</div>
                                                    <div className="text-white font-medium text-sm">{user.name}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 bg-[#0a0a0f] p-4 rounded-xl border border-gray-800">
                                                <span className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">📧</span>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email</div>
                                                    <div className="text-white font-medium text-sm break-all">{user.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 bg-[#0a0a0f] p-4 rounded-xl border border-gray-800">
                                                <span className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">📞</span>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Phone</div>
                                                    <div className="text-white font-medium text-sm">{user.phone || 'Not Provided'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Floating Save Button */}
                    <AnimatePresence>
                        {isEditing && (
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 50, opacity: 0 }}
                                className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none"
                            >
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-full font-bold shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2 pointer-events-auto border border-orange-400/30"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            💾 Save All Changes
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </div>
    );
};

export default ProviderProfile;
