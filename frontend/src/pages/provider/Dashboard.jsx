import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import API_URL from '../../config/api';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [company, setCompany] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // overview, services

    // Forms state
    const [companyForm, setCompanyForm] = useState({
        name: '', description: '', email: '', phone: '', website: '',
        address: { street: '', city: '', state: '', zipCode: '' }
    });

    const [serviceForm, setServiceForm] = useState({
        name: '', description: '', price: '', priceType: 'fixed',
        category: 'other', duration: '', location: '', tags: ''
    });
    const [showServiceModal, setShowServiceModal] = useState(false);

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        try {
            const res = await fetch(`${API_URL}/api/companies/me`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setCompany(data);
                setServices(data.services || []);
                // Pre-fill form
                setCompanyForm({
                    name: data.name, description: data.description, email: data.email,
                    phone: data.phone, website: data.website,
                    address: { ...data.address }
                });
            } else if (res.status === 404) {
                setCompany(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCompanySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = company ? `${API_URL}/api/companies/${company.id}` : `${API_URL}/api/companies`;
            const method = company ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(companyForm)
            });

            const data = await res.json();
            if (res.ok) {
                setCompany(data);
                setMessage(company ? 'Profile updated!' : 'Company registered successfully!');
                if (!company) fetchCompany(); // Refresh to get services array
            } else {
                setError(data.message || 'Operation failed');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ...serviceForm, company: company.id })
            });

            const data = await res.json();
            if (res.ok) {
                setServices([data, ...services]);
                setShowServiceModal(false);
                setServiceForm({
                    name: '', description: '', price: '', priceType: 'fixed',
                    category: 'other', duration: '', location: '', tags: ''
                });
                setMessage('Service added successfully!');
            } else {
                setError(data.message || 'Failed to add service');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteService = async (id) => {
        if (!confirm('Delete this service?')) return;
        try {
            const res = await fetch(`${API_URL}/api/services/${id}?force=true`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setServices(services.filter(s => s.id !== id));
                setMessage('Service deleted');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-orange-400">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <nav className="border-b border-gray-800 p-4 flex justify-between items-center bg-gray-900/50 backdrop-blur sticky top-0 z-50">
                <Link to="/" className="text-2xl font-bold text-orange-400" style={{ fontFamily: 'Creepster, cursive' }}>
                    🎃 ServiceBee Provider
                </Link>
                <div className="flex items-center gap-4">
                    <span>{user?.name}</span>
                    <button onClick={logout} className="text-sm bg-red-500/10 text-red-400 px-3 py-1 rounded hover:bg-red-500/20">Logout</button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6">
                {error && <div className="bg-red-500/20 text-red-400 p-4 rounded mb-6">{error}</div>}
                {message && <div className="bg-green-500/20 text-green-400 p-4 rounded mb-6">{message}</div>}

                {!company ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
                        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                            <h2 className="text-2xl font-bold mb-6 text-center">Register Your Company</h2>
                            <form onSubmit={handleCompanySubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                                    <input type="text" required value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} className="w-full bg-gray-700 rounded p-2 focus:ring-2 focus:ring-orange-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                                    <textarea value={companyForm.description} onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })} className="w-full bg-gray-700 rounded p-2 focus:ring-2 focus:ring-orange-500 outline-none" rows="3"></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Business Email</label>
                                        <input type="email" required value={companyForm.email} onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })} className="w-full bg-gray-700 rounded p-2 focus:ring-2 focus:ring-orange-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Phone</label>
                                        <input type="text" value={companyForm.phone} onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })} className="w-full bg-gray-700 rounded p-2 focus:ring-2 focus:ring-orange-500 outline-none" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded transition">Register As Provider</button>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    <div>
                        <div className="flex gap-4 mb-8 border-b border-gray-800">
                            <button onClick={() => setActiveTab('overview')} className={`pb-4 px-2 ${activeTab === 'overview' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400 hover:text-white'}`}>Overview</button>
                            <button onClick={() => setActiveTab('services')} className={`pb-4 px-2 ${activeTab === 'services' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400 hover:text-white'}`}>Services ({services.length})</button>
                        </div>

                        {activeTab === 'overview' && (
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
                                    <h3 className="text-xl font-bold mb-4">Company Details</h3>
                                    <form onSubmit={handleCompanySubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-400">Name</label>
                                                <input type="text" value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} className="w-full bg-gray-700 rounded p-2" />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400">Email</label>
                                                <input type="email" value={companyForm.email} onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })} className="w-full bg-gray-700 rounded p-2" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400">Description</label>
                                            <textarea value={companyForm.description} onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })} className="w-full bg-gray-700 rounded p-2" rows="3"></textarea>
                                        </div>
                                        <button type="submit" className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded hover:bg-orange-500/30">Save Changes</button>
                                    </form>
                                </div>
                                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 h-fit">
                                    <h3 className="text-xl font-bold mb-4">Stats</h3>
                                    <div className="space-y-4">
                                        <div className="bg-gray-700/50 p-4 rounded-lg">
                                            <div className="text-gray-400 text-sm">Total Services</div>
                                            <div className="text-2xl font-bold">{services.length}</div>
                                        </div>
                                        <div className="bg-gray-700/50 p-4 rounded-lg">
                                            <div className="text-gray-400 text-sm">Status</div>
                                            <div className={`text-lg font-bold ${company.isActive ? 'text-green-400' : 'text-red-400'}`}>{company.isActive ? 'Active' : 'Inactive'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'services' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold">Your Services</h2>
                                    <button onClick={() => setShowServiceModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2">
                                        <span>+ Add Service</span>
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {services.map(service => (
                                        <motion.div key={service.id} layout className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 group">
                                            <div className="h-32 bg-gray-700 relative">
                                                {service.image && <img src={service.image} alt={service.name} className="w-full h-full object-cover" />}
                                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                                    <button onClick={() => handleDeleteService(service.id)} className="bg-red-500 text-white p-1 rounded">🗑</button>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                                                <p className="text-gray-400 text-sm mb-2 line-clamp-2">{service.description}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-orange-400 font-bold">₹{service.price}</span>
                                                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">{service.category}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Service Modal */}
            {showServiceModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-gray-800 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Add New Service</h2>
                        <form onSubmit={handleServiceSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Service Name</label>
                                <input type="text" required value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} className="w-full bg-gray-700 rounded p-2 focus:ring-2 focus:ring-orange-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Category</label>
                                <select value={serviceForm.category} onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })} className="w-full bg-gray-700 rounded p-2 outline-none">
                                    <option value="plumbing">Plumbing</option>
                                    <option value="electrical">Electrical</option>
                                    <option value="cleaning">Cleaning</option>
                                    <option value="carpentry">Carpentry</option>
                                    <option value="painting">Painting</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
                                    <input type="number" required value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} className="w-full bg-gray-700 rounded p-2 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Price Type</label>
                                    <select value={serviceForm.priceType} onChange={e => setServiceForm({ ...serviceForm, priceType: e.target.value })} className="w-full bg-gray-700 rounded p-2 outline-none">
                                        <option value="fixed">Fixed</option>
                                        <option value="hourly">Hourly</option>
                                        <option value="quote">Quote-based</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Description</label>
                                <textarea required value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full bg-gray-700 rounded p-2 outline-none" rows="3"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Location (City/Area)</label>
                                <input type="text" required value={serviceForm.location} onChange={e => setServiceForm({ ...serviceForm, location: e.target.value })} className="w-full bg-gray-700 rounded p-2 outline-none" />
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setShowServiceModal(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded">Cancel</button>
                                <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded">Add Service</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
