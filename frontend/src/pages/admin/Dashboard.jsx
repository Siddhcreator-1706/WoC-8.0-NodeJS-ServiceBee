import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Service Management Component
const ServiceManagement = () => {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '', description: '', price: '', location: '', category: 'other', featured: false
    });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingService ? 'PUT' : 'POST';
        const url = editingService ? `${API_URL}/api/services/${editingService._id}` : `${API_URL}/api/services`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchServices();
                setShowModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Failed to save service:', error);
        }
    };

    const resetForm = () => {
        setEditingService(null);
        setFormData({ name: '', description: '', price: '', location: '', category: 'other', featured: false });
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name, description: service.description, price: service.price,
            location: service.location, category: service.category, featured: service.featured
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await fetch(`${API_URL}/api/services/${id}`, { method: 'DELETE', credentials: 'include' });
            fetchServices();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const categories = ['cleaning', 'repair', 'beauty', 'tech', 'moving', 'events', 'other'];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl text-white font-bold">Manage Services</h2>
                <button onClick={() => { setShowModal(true); resetForm(); }} className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                    + Add Service
                </button>
            </div>

            {loading ? <div className="text-gray-400">Loading...</div> : (
                <div className="bg-gray-800/50 rounded-xl overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-purple-500/10">
                            <tr className="text-left text-gray-300">
                                <th className="p-4">Name</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Rating</th>
                                <th className="p-4">Featured</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service._id} className="border-t border-purple-500/10 text-gray-300">
                                    <td className="p-4">{service.name}</td>
                                    <td className="p-4">{service.location}</td>
                                    <td className="p-4 capitalize">{service.category}</td>
                                    <td className="p-4">${service.price}</td>
                                    <td className="p-4">⭐ {service.averageRating || 'N/A'}</td>
                                    <td className="p-4">{service.featured ? '✅' : '❌'}</td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => handleEdit(service)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                        {user?.role === 'superuser' && (
                                            <button onClick={() => handleDelete(service._id)} className="text-red-400 hover:text-red-300">Delete</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-gray-800 p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl text-orange-400 mb-4">{editingService ? 'Edit' : 'Add'} Service</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Service Name" required className="w-full p-3 bg-gray-700 rounded-lg text-white" />
                            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" required className="w-full p-3 bg-gray-700 rounded-lg text-white h-24" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="Price" required className="w-full p-3 bg-gray-700 rounded-lg text-white" />
                                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Location" required className="w-full p-3 bg-gray-700 rounded-lg text-white" />
                            </div>
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 bg-gray-700 rounded-lg text-white capitalize">
                                {categories.map(cat => <option key={cat} value={cat} className="capitalize">{cat}</option>)}
                            </select>
                            <label className="flex items-center gap-2 text-gray-300">
                                <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-5 h-5" />
                                Featured Service
                            </label>
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 py-2 bg-orange-500 text-white rounded-lg">Save</button>
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-600 text-white rounded-lg">Cancel</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

// Complaint Management Component
const ComplaintManagement = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => { fetchComplaints(); }, [filter]);

    const fetchComplaints = async () => {
        try {
            const url = filter ? `${API_URL}/api/complaints?status=${filter}` : `${API_URL}/api/complaints`;
            const res = await fetch(url, { credentials: 'include' });
            const data = await res.json();
            setComplaints(data);
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status, adminResponse = '') => {
        try {
            await fetch(`${API_URL}/api/complaints/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status, adminResponse })
            });
            fetchComplaints();
        } catch (error) {
            console.error('Failed to update:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-400 bg-yellow-400/20';
            case 'in-progress': return 'text-blue-400 bg-blue-400/20';
            case 'resolved': return 'text-green-400 bg-green-400/20';
            case 'rejected': return 'text-red-400 bg-red-400/20';
            default: return 'text-gray-400 bg-gray-400/20';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl text-white font-bold">Manage Complaints</h2>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="p-2 bg-gray-700 rounded-lg text-white">
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {loading ? <div className="text-gray-400">Loading...</div> : complaints.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No complaints found.</div>
            ) : (
                <div className="space-y-4">
                    {complaints.map(complaint => (
                        <div key={complaint._id} className="bg-gray-800/50 p-6 rounded-xl border border-purple-500/20">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-white">{complaint.subject}</h3>
                                    <p className="text-sm text-purple-400">By: {complaint.user?.name} | Service: {complaint.service?.name}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(complaint.status)}`}>{complaint.status}</span>
                            </div>
                            <p className="text-gray-400 mb-4">{complaint.message}</p>
                            <div className="flex gap-2 flex-wrap">
                                {complaint.status === 'pending' && (
                                    <>
                                        <button onClick={() => updateStatus(complaint._id, 'in-progress')} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded">Mark In Progress</button>
                                        <button onClick={() => updateStatus(complaint._id, 'rejected', 'Issue could not be addressed.')} className="px-3 py-1 bg-red-500/20 text-red-400 rounded">Reject</button>
                                    </>
                                )}
                                {complaint.status === 'in-progress' && (
                                    <button onClick={() => updateStatus(complaint._id, 'resolved', 'Issue has been resolved.')} className="px-3 py-1 bg-green-500/20 text-green-400 rounded">Mark Resolved</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Main Dashboard
const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('services');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <nav className="px-6 py-4 flex justify-between items-center border-b border-purple-500/20">
                <Link to="/"><h1 className="text-2xl font-bold text-orange-400" style={{ fontFamily: 'Creepster, cursive' }}>🎃 Admin Panel</h1></Link>
                <div className="flex gap-4 items-center">
                    {user?.role === 'superuser' && <Link to="/superuser" className="text-green-400 hover:text-green-300">Superuser</Link>}
                    <span className="text-gray-300">{user?.name}</span>
                    <button onClick={logout} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg">Logout</button>
                </div>
            </nav>

            <div className="p-6">
                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button onClick={() => setActiveTab('services')} className={`px-6 py-2 rounded-lg ${activeTab === 'services' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                        📦 Services
                    </button>
                    <button onClick={() => setActiveTab('complaints')} className={`px-6 py-2 rounded-lg ${activeTab === 'complaints' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                        📢 Complaints
                    </button>
                </div>

                {activeTab === 'services' && <ServiceManagement />}
                {activeTab === 'complaints' && <ComplaintManagement />}
            </div>
        </div>
    );
};

export default Dashboard;
