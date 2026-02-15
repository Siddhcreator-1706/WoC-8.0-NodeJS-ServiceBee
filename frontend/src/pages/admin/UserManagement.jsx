import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_URL from '../../config/api';
import CustomSelect from '../../components/ui/CustomSelect';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [message, setMessage] = useState({ text: '', type: '' });

    const [banModal, setBanModal] = useState({ isOpen: false, user: null });
    const [banForm, setBanForm] = useState({ duration: 0, reason: '' });
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, user: null });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/users?includeInactive=true`, { withCredentials: true });
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage({ text: 'Failed to fetch users', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleBanClick = (user) => {
        if (user.isActive) {
            setBanModal({ isOpen: true, user });
            setBanForm({ duration: 0, reason: '' });
        } else {
            handleUnban(user);
        }
    };

    const handleViewDetails = (user) => {
        setDetailsModal({ isOpen: true, user });
    };

    const handleBanSubmit = async () => {
        if (!banModal.user) return;
        try {
            await axios.delete(`${API_URL}/api/users/${banModal.user._id}?force=true&reason=${encodeURIComponent(banForm.reason || 'Admin Ban')}&days=${banForm.duration}`, { withCredentials: true });
            setMessage({ text: `User banned ${banForm.duration > 0 ? `for ${banForm.duration} days` : 'indefinitely'}`, type: 'success' });
            setBanModal({ isOpen: false, user: null });
            fetchUsers();
        } catch (error) {
            console.error('Ban failed:', error);
            setMessage({ text: error.response?.data?.message || 'Ban failed', type: 'error' });
        }
    };

    const handleUnban = async (user) => {
        if (!confirm(`Are you sure you want to reactivate ${user.name}?`)) return;
        try {
            await axios.put(`${API_URL}/api/users/${user._id}/reactivate`, {}, { withCredentials: true });
            setMessage({ text: 'User unbanned successfully', type: 'success' });
            fetchUsers();
        } catch (error) {
            console.error('Unban failed:', error);
            setMessage({ text: error.response?.data?.message || 'Unban failed', type: 'error' });
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete user ${name}? This cannot be undone.`)) return;

        try {
            await axios.delete(`${API_URL}/api/users/${id}`, { withCredentials: true });
            setMessage({ text: 'User permanently deleted', type: 'success' });
            fetchUsers();
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Delete failed', type: 'error' });
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            (user.company?.name && user.company.name.toLowerCase().includes(search.toLowerCase()));

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    return (
        <div>
            {/* Header + Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 font-bold font-creepster tracking-wider">
                        🦇 Manage Users & Companies
                    </h2>
                    <p className="text-gray-500 text-xs mt-1">{filteredUsers.length} users found</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="w-40 sm:w-48">
                        <CustomSelect
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            options={[
                                { value: 'all', label: 'All Roles' },
                                { value: 'user', label: 'Customers' },
                                { value: 'provider', label: 'Providers' },
                                { value: 'admin', label: 'Admins' }
                            ]}
                            icon={<span className="text-lg">👥</span>}
                            className="z-20"
                        />
                    </div>

                    <div className="relative flex-1 md:w-56">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#0d0d14] text-gray-200 px-4 py-2.5 rounded-xl pl-9 border border-orange-900/20 focus:outline-none focus:border-orange-500/40 transition-all placeholder-gray-600 text-sm"
                        />
                        <svg className="w-4 h-4 text-gray-600 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
            </div>

            {/* Message Toast */}
            {message.text && (
                <div className={`p-3.5 mb-5 rounded-xl border text-sm ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-[#0d0d14]/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-orange-900/15 shadow-xl flex flex-col w-full">
                    <div>
                        <table className="w-full table-fixed">
                            <thead className="border-b border-orange-900/15">
                                <tr className="text-left text-gray-500 text-[11px] uppercase tracking-wider">
                                    <th className="p-4 font-semibold w-full">User / Company</th>
                                    <th className="p-4 font-semibold text-right w-[100px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {filteredUsers.map(user => (
                                    <tr key={user._id} className="text-gray-300 hover:bg-orange-500/[0.03] transition-colors group">
                                        <td className="p-4 w-full">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden border border-gray-700/50 group-hover:border-orange-500/30 transition-colors shrink-0 relative">
                                                    {user.role === 'provider' && user.company?.logo ? (
                                                        <img src={user.company.logo} alt="" className="w-full h-full object-cover" />
                                                    ) : user.avatar && user.avatar !== 'default-avatar.png' ? (
                                                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-lg">{user.role === 'provider' ? '🏢' : user.role === 'admin' ? '👑' : '👤'}</span>
                                                    )}

                                                    {user.role === 'provider' && user.company?.isVerified && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border border-[#0d0d14]">
                                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-semibold text-white text-sm truncate max-w-[120px] sm:max-w-none">
                                                        {user.role === 'provider' && user.company ? user.company.name : user.name}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                                        <span className={`uppercase font-bold text-[10px] ${user.role === 'admin' ? 'text-red-400' :
                                                            user.role === 'provider' ? 'text-blue-400' : 'text-green-400'
                                                            }`}>{user.role}</span>
                                                        <span className="text-gray-700">·</span>
                                                        <span className={`${user.isActive ? 'text-green-500' : 'text-red-500'}`}>
                                                            {user.isActive ? 'Active' : 'Banned'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleViewDetails(user)}
                                                    className="px-3 py-1.5 text-xs text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors border border-transparent hover:border-orange-500/20"
                                                    title="View Full Details"
                                                >
                                                    View
                                                </button>
                                                {user.role !== 'admin' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleBanClick(user)}
                                                            className={`p-1.5 rounded-lg transition-colors text-sm
                                                                ${user.isActive ? 'text-yellow-500/60 hover:text-yellow-500 hover:bg-yellow-500/10' : 'text-green-500/60 hover:text-green-500 hover:bg-green-500/10'}`}
                                                            title={user.isActive ? 'Ban User' : 'Unban User'}
                                                        >
                                                            {user.isActive ? '🚫' : '✅'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user._id, user.name)}
                                                            className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                                                            title="Delete Permanently"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                            <span className="text-4xl mb-2 opacity-30">🦇</span>
                            <p className="text-sm">No users found matching "{search}"</p>
                        </div>
                    )}
                </div>
            )}

            {/* Ban Modal */}
            {banModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setBanModal({ isOpen: false, user: null })}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#0d0d14] border border-red-900/20 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-red-900/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-red-400 mb-4 font-creepster tracking-wide">🚫 Ban User: {banModal.user?.name}</h3>

                        <div className="space-y-4">
                            <div>
                                <CustomSelect
                                    label="Duration"
                                    value={banForm.duration}
                                    onChange={(e) => setBanForm({ ...banForm, duration: parseInt(e.target.value) })}
                                    options={[
                                        { value: 0, label: 'Indefinite (Permanent)' },
                                        { value: 7, label: '7 Days' },
                                        { value: 30, label: '30 Days' },
                                        { value: 90, label: '90 Days' }
                                    ]}
                                    icon={<span className="text-lg">⏳</span>}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Reason (Optional)</label>
                                <textarea
                                    value={banForm.reason}
                                    onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                                    className="w-full bg-[#0a0a0f] border border-gray-700/50 rounded-xl p-3 text-white text-sm outline-none focus:border-red-500/40 resize-none"
                                    rows="3"
                                    placeholder="Violation of terms..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setBanModal({ isOpen: false, user: null })}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBanSubmit}
                                    className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-900/20 transition-colors"
                                >
                                    Ban User
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* View Details Modal */}
            {detailsModal.isOpen && detailsModal.user && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setDetailsModal({ isOpen: false, user: null })}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#0d0d14] border border-orange-900/20 p-6 rounded-2xl w-full max-w-2xl shadow-2xl shadow-orange-900/10 max-h-[85vh] overflow-y-auto custom-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-5 border-b border-orange-900/15 pb-2">
                            <h3 className="text-lg text-orange-300 font-bold font-creepster tracking-wide">
                                User Details
                            </h3>
                            <button onClick={() => setDetailsModal({ isOpen: false, user: null })} className="text-gray-500 hover:text-white transition-colors text-xl">✕</button>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden border border-gray-700/50 shadow-lg relative">
                                    {detailsModal.user.role === 'provider' && detailsModal.user.company?.logo ? (
                                        <img src={detailsModal.user.company.logo} alt="" className="w-full h-full object-cover" />
                                    ) : detailsModal.user.avatar && detailsModal.user.avatar !== 'default-avatar.png' ? (
                                        <img src={detailsModal.user.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl">{detailsModal.user.role === 'provider' ? '🏢' : detailsModal.user.role === 'admin' ? '👑' : '👤'}</span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white">{detailsModal.user.name}</h4>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mt-1">{detailsModal.user.role} Account</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#0a0a0f] p-3 rounded-xl border border-gray-800/50">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Email</div>
                                    <div className="text-white text-sm break-all">{detailsModal.user.email}</div>
                                </div>
                                <div className="bg-[#0a0a0f] p-3 rounded-xl border border-gray-800/50">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Status</div>
                                    <div className={`${detailsModal.user.isActive ? 'text-green-500' : 'text-red-500'} font-bold text-sm`}>
                                        {detailsModal.user.isActive ? 'Active' : 'Banned'}
                                    </div>
                                </div>
                                <div className="bg-[#0a0a0f] p-3 rounded-xl border border-gray-800/50">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Joined</div>
                                    <div className="text-gray-300 text-sm">{new Date(detailsModal.user.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="bg-[#0a0a0f] p-3 rounded-xl border border-gray-800/50">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Last Active</div>
                                    <div className="text-gray-300 text-sm">Recently</div>
                                </div>
                            </div>

                            {detailsModal.user.role === 'provider' && detailsModal.user.company && (
                                <div className="bg-[#0a0a0f] p-4 rounded-xl border border-gray-800/50">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-3 font-semibold">Company Information</div>
                                    <div className="space-y-3 text-sm">
                                        {detailsModal.user.company.description && (
                                            <div className="mb-3 pb-3 border-b border-gray-800/50">
                                                <span className="text-gray-500 block text-xs mb-1">Description</span>
                                                <p className="text-gray-300 leading-relaxed text-xs">{detailsModal.user.company.description}</p>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                            <div>
                                                <span className="text-gray-500 block text-xs">Company Name</span>
                                                <span className="text-white font-medium">{detailsModal.user.company.name}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block text-xs">Service Type</span>
                                                <span className="text-white capitalize">{detailsModal.user.company.serviceType || 'General'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block text-xs">Email</span>
                                                <span className="text-blue-400">{detailsModal.user.company.email}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block text-xs">Phone</span>
                                                <span className="text-gray-300">{detailsModal.user.company.phone || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block text-xs">Website</span>
                                                <a href={detailsModal.user.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 truncate block">
                                                    {detailsModal.user.company.website || 'N/A'}
                                                </a>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block text-xs">Verified</span>
                                                <span className={detailsModal.user.company.isVerified ? 'text-green-500' : 'text-gray-600'}>
                                                    {detailsModal.user.company.isVerified ? 'Yes ✅' : 'No ❌'}
                                                </span>
                                            </div>
                                        </div>
                                        {detailsModal.user.company.address && (
                                            <div className="mt-2 pt-2 border-t border-gray-800/50">
                                                <span className="text-gray-500 block text-xs mb-1">Location</span>
                                                <p className="text-gray-300">
                                                    {[
                                                        detailsModal.user.company.address.street,
                                                        detailsModal.user.company.address.city,
                                                        detailsModal.user.company.address.state,
                                                        detailsModal.user.company.address.country
                                                    ].filter(Boolean).join(', ') || 'Address not available'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setDetailsModal({ isOpen: false, user: null })}
                                    className="px-5 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl transition-colors text-sm font-medium border border-orange-500/20"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default UserManagement;
