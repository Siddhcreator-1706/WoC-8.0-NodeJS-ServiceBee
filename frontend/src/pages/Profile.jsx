import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import API_URL from '../config/api';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        currentPassword: '',
        newPassword: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

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
            location: user.location || ''
        }));
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ text: 'Profile updated successfully!', type: 'success' });
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
            } else {
                setMessage({ text: data.message || 'Failed to update', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Error updating profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            {/* Navbar */}
            <nav className="px-6 py-4 flex justify-between items-center border-b border-purple-500/20">
                <Link to="/">
                    <h1 className="text-2xl font-bold text-orange-400" style={{ fontFamily: 'Creepster, cursive' }}>
                        🎃 ServiceBee
                    </h1>
                </Link>
                <div className="flex gap-4">
                    <Link to="/favorites" className="text-gray-300 hover:text-orange-400">Favorites</Link>
                    <Link to="/complaints" className="text-gray-300 hover:text-orange-400">Complaints</Link>
                    <button onClick={logout} className="text-red-400">Logout</button>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 p-8 rounded-2xl border border-purple-500/20"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center text-4xl">
                            👤
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                            <span className="text-purple-400 capitalize">{user.role}</span>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`p-3 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm mb-1">Name</label>
                                <input
                                    type="text" name="name" value={formData.name} onChange={handleChange}
                                    className="w-full p-3 bg-gray-700 rounded-lg text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm mb-1">Email</label>
                                <input
                                    type="email" name="email" value={formData.email} onChange={handleChange}
                                    className="w-full p-3 bg-gray-700 rounded-lg text-white"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm mb-1">Phone</label>
                                <input
                                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                    className="w-full p-3 bg-gray-700 rounded-lg text-white"
                                    placeholder="Optional"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm mb-1">Location</label>
                                <input
                                    type="text" name="location" value={formData.location} onChange={handleChange}
                                    className="w-full p-3 bg-gray-700 rounded-lg text-white"
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        <hr className="border-purple-500/20" />

                        <h3 className="text-lg text-orange-400">Change Password</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm mb-1">Current Password</label>
                                <input
                                    type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange}
                                    className="w-full p-3 bg-gray-700 rounded-lg text-white"
                                    placeholder="Leave empty to keep current"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm mb-1">New Password</label>
                                <input
                                    type="password" name="newPassword" value={formData.newPassword} onChange={handleChange}
                                    className="w-full p-3 bg-gray-700 rounded-lg text-white"
                                    placeholder="Leave empty to keep current"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
