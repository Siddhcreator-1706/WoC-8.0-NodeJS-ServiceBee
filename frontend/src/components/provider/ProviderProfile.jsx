import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '../common/ImageUpload';
import CustomSelect from '../ui/CustomSelect';
import useLocationData from '../../hooks/useLocationData';
import axios from 'axios';
import API_URL from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const ProviderProfile = ({ company, onUpdate }) => {
    const { user, updateUser } = useAuth();
    const [editMode, setEditMode] = useState(null); // 'details' | 'password' | null
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Company Form State
    const [logo, setLogo] = useState([]);
    const [companyForm, setCompanyForm] = useState({
        name: '', description: '', website: '',
        address: { street: '', city: '', state: '', zipCode: '' }
    });

    // Account Form State (User Data)
    const [userForm, setUserForm] = useState({
        name: '', email: '', phone: '', currentPassword: '', newPassword: '', confirmPassword: ''
    });

    // Location Data Hook
    const { statesList, districtsList, loadingStates, loadingDistricts } = useLocationData(companyForm.address.state);

    useEffect(() => {
        if (company) {
            setCompanyForm({
                name: company.name,
                description: company.description,
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

    const handleProfileSave = async (e) => {
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
            formData.append('website', companyForm.website);
            formData.append('address', JSON.stringify(companyForm.address));

            if (logo.length > 0 && logo[0] instanceof File) {
                formData.append('logo', logo[0]);
            }

            if (company?._id) {
                try {
                    await axios.put(`${API_URL}/api/companies/${company._id}`, formData);
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

            if (errors.length > 0) {
                setMessage({ text: errors.join('. '), type: 'error' });
            } else {
                setMessage({ text: 'Profile updated successfully! ✨', type: 'success' });
                setEditMode(null);
                if (onUpdate) onUpdate();
            }

        } catch (err) {
            setMessage({ text: 'An unexpected error occurred.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setSubmitting(true);

        if (userForm.newPassword !== userForm.confirmPassword) {
            setMessage({ text: 'New passwords do not match', type: 'error' });
            setSubmitting(false);
            return;
        }

        try {
            await axios.put(`${API_URL}/api/users/password`, {
                currentPassword: userForm.currentPassword,
                newPassword: userForm.newPassword
            });
            setMessage({ text: 'Password updated successfully! 🔒', type: 'success' });
            setEditMode(null);
            setUserForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        } catch (err) {
            setMessage({ text: `Password Update Failed: ${err.response?.data?.message || err.message}`, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!company) return null;

    // Stats Data
    const stats = [
        { label: 'Avg Rating', value: company.stats?.overallRating || '0.0', icon: '⭐', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
        { label: 'Bookings Done', value: company.stats?.completedBookings || 0, icon: '✅', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        { label: 'Active Services', value: company.services?.length || 0, icon: '⚡', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { label: 'Total Reviews', value: company.stats?.totalReviews || 0, icon: '💬', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    ];

    return (
        <div className="relative min-h-[80vh] ">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-orange-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto space-y-6 px-4 md:px-0">

                {/* 1. Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#15151e]/80 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left"
                >
                    {/* Spooky Texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

                    <div className="flex flex-col md:flex-row items-center gap-5 relative z-10 w-full md:w-auto">
                        <div className="w-24 h-24 md:w-24 md:h-24 bg-[#0a0a0f] rounded-full flex items-center justify-center text-4xl border-2 border-gray-700 shadow-lg overflow-hidden relative group shrink-0">
                            {logo[0]?.preview ? (
                                <img src={logo[0].preview} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <span>🏗️</span>
                            )}
                            {editMode === 'details' && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <ImageUpload
                                        label="📷"
                                        maxImages={1}
                                        existingImages={logo}
                                        onImagesChange={setLogo}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-center md:items-start">
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

                    <div className="relative z-10 flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        {editMode !== 'details' && (
                            <button
                                onClick={() => setEditMode('password')}
                                className={`w-full md:w-auto px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg text-sm md:text-base border border-gray-700 ${editMode === 'password' ? 'bg-orange-600/20 text-orange-400 border-orange-500/50' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            >
                                🔒 Change Password
                            </button>
                        )}
                        <button
                            onClick={() => setEditMode(editMode === 'details' ? null : 'details')}
                            className={`w-full md:w-auto px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg text-sm md:text-base flex items-center justify-center gap-2 ${editMode === 'details'
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 shadow-orange-900/30'}`}
                        >
                            {editMode === 'details' ? 'Cancel Edit' : 'Edit Profile'}
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
                            <div className={`text-xl md:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
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

                {/* 3. Combined Content Area */}
                <div className="relative">
                    {editMode === 'details' ? (
                        <form onSubmit={handleProfileSave}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#15151e]/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 pb-24 md:pb-6"
                            >
                                <h3 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
                                    <span className="text-orange-500">⚙️</span> Edit Profile
                                </h3>

                                <div className="space-y-6">
                                    {/* Company Details Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-orange-500/10 p-1.5 rounded-lg">
                                                <span className="text-lg">🏢</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Company Information</h4>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-gray-500 text-xs uppercase font-bold mb-1.5 ml-1">Company Name</label>
                                                <input
                                                    type="text"
                                                    value={companyForm.name}
                                                    onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                                                    className="w-full bg-[#0f0f13] border border-gray-800/60 rounded-xl p-3 text-gray-200 focus:border-orange-500/50 focus:bg-[#1a1a24] outline-none transition-all shadow-inner"
                                                    placeholder="e.g. Phantom Services"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-500 text-xs uppercase font-bold mb-1.5 ml-1">Website</label>
                                                <input
                                                    type="url"
                                                    value={companyForm.website}
                                                    onChange={e => setCompanyForm({ ...companyForm, website: e.target.value })}
                                                    className="w-full bg-[#0f0f13] border border-gray-800/60 rounded-xl p-3 text-blue-400 focus:border-orange-500/50 focus:bg-[#1a1a24] outline-none transition-all shadow-inner"
                                                    placeholder="https://your-site.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-500 text-xs uppercase font-bold mb-1.5 ml-1">Description</label>
                                            <textarea
                                                value={companyForm.description}
                                                onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })}
                                                className="w-full bg-[#0f0f13] border border-gray-800/60 rounded-xl p-3 text-gray-300 h-28 focus:border-orange-500/50 focus:bg-[#1a1a24] outline-none transition-all shadow-inner resize-none leading-relaxed"
                                                placeholder="Tell us about your services..."
                                            />
                                        </div>

                                        {/* Location Selectors */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <CustomSelect
                                                label="State"
                                                options={statesList}
                                                value={companyForm.address.state}
                                                onChange={e => setCompanyForm({ ...companyForm, address: { ...companyForm.address, state: e.target.value, city: '' } })}
                                                loading={loadingStates}
                                                className="w-full"
                                            />
                                            <CustomSelect
                                                label="City"
                                                options={districtsList}
                                                value={companyForm.address.city}
                                                onChange={e => setCompanyForm({ ...companyForm, address: { ...companyForm.address, city: e.target.value } })}
                                                loading={loadingDistricts}
                                                disabled={!companyForm.address.state}
                                                placeholder={companyForm.address.state ? "Select City" : "Select State First"}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Personal Info Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 py-2">
                                            <div className="h-px bg-gray-800 flex-1"></div>
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Personal & Contact Info</span>
                                            <div className="h-px bg-gray-800 flex-1"></div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-gray-500 text-xs uppercase font-bold mb-1.5 ml-1">Your Name</label>
                                                <input
                                                    type="text"
                                                    value={userForm.name}
                                                    onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                                                    className="w-full bg-[#0f0f13] border border-gray-800/60 rounded-xl p-3 text-gray-200 focus:border-orange-500/50 focus:bg-[#1a1a24] outline-none transition-all shadow-inner"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-500 text-xs uppercase font-bold mb-1.5 ml-1">Email (Read-only)</label>
                                                <input
                                                    type="email"
                                                    value={userForm.email}
                                                    readOnly
                                                    className="w-full bg-[#0a0a0f]/30 border border-gray-800/30 rounded-xl p-3 text-gray-400 cursor-not-allowed select-all"
                                                    title="Email cannot be changed"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-500 text-xs uppercase font-bold mb-1.5 ml-1">Phone</label>
                                                <input
                                                    type="text"
                                                    value={userForm.phone}
                                                    onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                                                    className="w-full bg-[#0f0f13] border border-gray-800/60 rounded-xl p-3 text-gray-200 focus:border-orange-500/50 focus:bg-[#1a1a24] outline-none transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Save Button */}
                            <AnimatePresence>
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 50, opacity: 0 }}
                                    className="fixed bottom-6 md:bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
                                >
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full md:w-auto max-w-md bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-full font-bold shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 pointer-events-auto border border-orange-400/30"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                💾 Save Profile
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            </AnimatePresence>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {/* Read Only View (Background when Password Modal is open) */}
                            <div className={`space-y-6 transition-all duration-300 ${editMode === 'password' ? 'blur-sm opacity-50 pointer-events-none' : ''}`}>
                                <div className="bg-[#15151e]/60 backdrop-blur-md rounded-2xl border border-gray-800 p-6 md:p-8 space-y-8">
                                    {/* About Section */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                                <span className="text-xl">📝</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-200">About Company</h3>
                                        </div>
                                        <p className="text-gray-400 leading-relaxed bg-[#0a0a0f] p-6 rounded-xl border border-gray-800/50 text-sm md:text-base">
                                            {company.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    {/* Info Grid - Changed to Single Column Stack as requested */}
                                    <div className="space-y-6">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                                    <span className="text-xl">📍</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-200">Location & Web</h3>
                                            </div>
                                            <div className="bg-[#0a0a0f] p-5 rounded-xl border border-gray-800/50 space-y-4">
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Address</div>
                                                    <div className="text-white font-medium">
                                                        {[company.address?.city, company.address?.state].filter(Boolean).join(', ') || 'Location not set'}
                                                    </div>
                                                </div>
                                                {company.website && (
                                                    <div className="pt-4 border-t border-gray-800">
                                                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Website</div>
                                                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium truncate block">
                                                            {company.website}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                                    <span className="text-xl">📞</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-200">Contact Details</h3>
                                            </div>
                                            <div className="bg-[#0a0a0f] p-5 rounded-xl border border-gray-800/50 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg">👤</div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Owner Name</div>
                                                        <div className="text-white font-medium">{user.name}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg">📧</div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email</div>
                                                        <div className="text-white font-medium break-all">{user.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg">📱</div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Phone</div>
                                                        <div className="text-white font-medium">{user.phone || 'Not Provided'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Password Modal */}
                    <AnimatePresence>
                        {editMode === 'password' && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                    onClick={() => setEditMode(null)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-[#15151e] w-full max-w-lg p-6 md:p-8 rounded-2xl border border-gray-800 shadow-2xl relative z-10"
                                >
                                    <button
                                        onClick={() => setEditMode(null)}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                                    >
                                        ✕
                                    </button>

                                    <h3 className="text-2xl font-bold text-gray-200 mb-6 flex items-center gap-2">
                                        <span className="text-orange-500">🔒</span> Change Password
                                    </h3>

                                    <form onSubmit={handlePasswordSave} className="space-y-5">

                                        <div>
                                            <label className="block text-gray-500 text-xs uppercase font-bold mb-1.5 ml-1">Current Password</label>
                                            <input
                                                type="password"
                                                value={userForm.currentPassword}
                                                onChange={e => setUserForm({ ...userForm, currentPassword: e.target.value })}
                                                className="w-full bg-[#0f0f13] border border-gray-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none transition-colors"
                                                placeholder="Enter current password"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-xs uppercase font-bold mb-1.5 ml-1">New Password</label>
                                            <input
                                                type="password"
                                                value={userForm.newPassword}
                                                onChange={e => setUserForm({ ...userForm, newPassword: e.target.value })}
                                                className="w-full bg-[#0f0f13] border border-gray-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none transition-colors"
                                                placeholder="Enter new password"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-xs uppercase font-bold mb-1.5 ml-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={userForm.confirmPassword}
                                                onChange={e => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                                                className="w-full bg-[#0f0f13] border border-gray-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none transition-colors"
                                                placeholder="Confirm new password"
                                                required
                                            />
                                        </div>

                                        <div className="pt-4 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setEditMode(null)}
                                                className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:shadow-lg hover:from-orange-500 hover:to-red-500 transition-all disabled:opacity-50"
                                            >
                                                {submitting ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ProviderProfile;
