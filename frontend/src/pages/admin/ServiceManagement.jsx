import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config/api';
import CustomSelect from '../../components/ui/CustomSelect';

const ServiceManagement = () => {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsModal, setStatsModal] = useState({ isOpen: false, service: null });

    // Search & Filter states
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch(`${API_URL}/api/services`);
            const data = await res.json();
            setServices(data.services || []);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete service "${name}"? This will remove all associated data.`)) return;
        try {
            await axios.delete(`${API_URL}/api/services/${id}?force=true`, { withCredentials: true });
            fetchServices();
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('Failed to delete service');
        }
    };

    const handleViewStats = (service) => {
        setStatsModal({ isOpen: true, service });
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) ||
            service.location.toLowerCase().includes(search.toLowerCase()) ||
            (service.company?.name && service.company.name.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = ['cleaning', 'repair', 'beauty', 'tech', 'moving', 'events', 'other', 'ritual', 'cleansing', 'exorcism', 'divination', 'astrology'];

    return (
        <div>
            {/* Header + Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 font-bold font-creepster tracking-wider">
                        🕯️ Manage Services
                    </h2>
                    <p className="text-gray-500 text-xs mt-1">{filteredServices.length} services found</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="w-48 sm:w-56">
                        <CustomSelect
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            options={[
                                { value: 'all', label: 'All Categories' },
                                ...categories.map(cat => ({
                                    value: cat,
                                    label: cat.charAt(0).toUpperCase() + cat.slice(1)
                                }))
                            ]}
                            icon={<span className="text-lg">🏷️</span>}
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

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredServices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-[#0d0d14]/50 rounded-2xl border border-dashed border-orange-900/20">
                    <span className="text-5xl mb-3 opacity-30">🕯️</span>
                    <h3 className="text-lg font-bold text-gray-400 mb-1">No Services Found</h3>
                    <p className="text-gray-600 text-sm">Try adjusting your search or filter criteria.</p>
                </div>
            ) : (
                <div className="bg-[#0d0d14]/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-orange-900/15 shadow-xl flex flex-col w-full">
                    <div>
                        <table className="w-full table-fixed">
                            <thead className="border-b border-orange-900/15">
                                <tr className="text-left text-gray-500 text-[11px] uppercase tracking-wider">
                                    <th className="p-4 font-semibold w-full">Service</th>
                                    <th className="p-4 font-semibold text-right w-[100px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {filteredServices.map((service) => (
                                    <tr key={service._id} className="text-gray-300 hover:bg-orange-500/[0.03] transition-colors group">
                                        <td className="p-4 w-full">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-gray-800/50 border border-gray-700/50 group-hover:border-orange-500/30 transition-colors shrink-0">
                                                    {service.image ? (
                                                        <img src={service.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-lg">🕯️</div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-semibold text-white text-sm truncate max-w-[120px] sm:max-w-none">{service.name}</div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                                                        <span>🏢</span>
                                                        <span className="truncate max-w-[100px] sm:max-w-none">{service.company?.name || 'Unknown'}</span>
                                                    </div>
                                                    <div className="text-[11px] text-gray-600 mt-0.5">
                                                        <span className="capitalize">{service.category}</span> · ₹{service.price}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleViewStats(service)}
                                                    className="px-3 py-1.5 text-xs text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors border border-transparent hover:border-orange-500/20"
                                                    title="View Full Details"
                                                >
                                                    View
                                                </button>
                                                {user?.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(service._id, service.name)}
                                                        className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete Service"
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Stats Modal */}
            {statsModal.isOpen && statsModal.service && createPortal(
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setStatsModal({ isOpen: false, service: null })}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#0d0d14] border border-orange-900/20 p-6 rounded-2xl w-full max-w-2xl shadow-2xl shadow-orange-900/10 max-h-[85vh] overflow-y-auto custom-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-5 border-b border-orange-900/15 pb-2">
                            <h3 className="text-lg text-orange-300 font-bold font-creepster tracking-wide">
                                Service Details
                            </h3>
                            <button onClick={() => setStatsModal({ isOpen: false, service: null })} className="text-gray-500 hover:text-white transition-colors text-xl">✕</button>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 border border-gray-700/50 shadow-lg relative">
                                    {statsModal.service.image ? (
                                        <img src={statsModal.service.image} alt={statsModal.service.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">🕯️</div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white">{statsModal.service.name}</h4>
                                    <p className="text-gray-500 text-sm">by {statsModal.service.company?.name}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#0a0a0f] p-3.5 rounded-xl border border-gray-800/50">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Rating</div>
                                    <div className="text-xl font-bold text-yellow-500 flex items-center gap-1.5">
                                        {statsModal.service.averageRating?.toFixed(1) || '0.0'} <span className="text-sm">⭐</span>
                                    </div>
                                </div>
                                <div className="bg-[#0a0a0f] p-3.5 rounded-xl border border-gray-800/50">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Reviews</div>
                                    <div className="text-xl font-bold text-blue-400">
                                        {statsModal.service.totalReviews || 0}
                                    </div>
                                </div>
                                <div className="bg-[#0a0a0f] p-3.5 rounded-xl border border-gray-800/50">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Price</div>
                                    <div className="text-xl font-bold text-green-400">
                                        ₹{statsModal.service.price}
                                    </div>
                                </div>
                                <div className="bg-[#0a0a0f] p-3.5 rounded-xl border border-gray-800/50">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Status</div>
                                    <div className={`text-lg font-bold ${statsModal.service.isActive ? 'text-green-500' : 'text-red-500'}`}>
                                        {statsModal.service.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-[#0a0a0f] p-3.5 rounded-xl border border-gray-800/50">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Category</div>
                                    <div className="text-white font-medium capitalize text-sm">{statsModal.service.category}</div>
                                </div>
                                <div className="bg-[#0a0a0f] p-3.5 rounded-xl border border-gray-800/50">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Location</div>
                                    <p className="text-white text-sm">{statsModal.service.location}</p>
                                    {statsModal.service.city && <p className="text-gray-500 text-xs mt-0.5">{statsModal.service.city}, {statsModal.service.state}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setStatsModal({ isOpen: false, service: null })}
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

export default ServiceManagement;
