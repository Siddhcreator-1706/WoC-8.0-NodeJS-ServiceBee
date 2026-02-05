import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import API_URL from '../../config/api';
import ImageUpload from '../../components/ImageUpload';

const Dashboard = () => {
    const { user, logout, logoutAll } = useAuth();
    const [company, setCompany] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');

    // activeTab initial state is derived from URL, defaulting to 'overview'
    const [activeTab, setActiveTab] = useState(tabParam || 'overview');
    const [logo, setLogo] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    // Sync state with URL changes
    useEffect(() => {
        if (tabParam && ['overview', 'services', 'bookings'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // Update URL when tab changes (internal navigation)
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

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

    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetchCompany();
    }, []);

    useEffect(() => {
        if (company) fetchBookings();
    }, [company]);

    const fetchBookings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/bookings/company-bookings`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleBookingStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/api/bookings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                const updatedBooking = await res.json();
                setBookings(bookings.map(b => b._id === id ? updatedBooking : b));
                setMessage(`Booking ${status}`);
            }
        } catch (err) {
            setError('Failed to update booking');
        }
    };

    const fetchCompany = async () => {
        try {
            const res = await fetch(`${API_URL}/api/companies/me`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setCompany(data);
                setServices(data.services || []);
                setCompanyForm({
                    name: data.name,
                    description: data.description,
                    email: data.email,
                    phone: data.phone,
                    website: data.website || '',
                    address: data.address || { street: '', city: '', state: '', zipCode: '' }
                });
                if (data.logo) {
                    setLogo([{ preview: data.logo }]);
                }
            }
        } catch (err) {
            console.error('No company found:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCompanySubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
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

            // removed debug logs

            const method = company ? 'PUT' : 'POST';
            const url = company
                ? `${API_URL}/api/companies/${company._id}`
                : `${API_URL}/api/companies`;

            const res = await fetch(url, {
                method,
                credentials: 'include',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setCompany(data);
                setMessage(company ? 'Company updated!' : 'Company registered successfully!');
                fetchCompany(); // Refresh to ensure strict sync
            } else {
                const data = await res.json();
                setError(data.message || 'Operation failed');
            }
        } catch (err) {
            setError('Something went wrong');
        }
    };

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(serviceForm)
            });

            if (res.ok) {
                setMessage('Service created successfully!');
                setShowServiceModal(false);
                fetchCompany(); // Refresh services
                setServiceForm({
                    name: '', description: '', price: '', priceType: 'fixed',
                    category: 'other', duration: '', location: '', tags: ''
                });
            } else {
                setError('Failed to create service');
            }
        } catch (err) {
            setError('Error creating service');
        }
    };

    const handleDeleteService = async (id) => {
        if (!window.confirm('Are you sure? This cannot be undone.')) return;
        try {
            const res = await fetch(`${API_URL}/api/services/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                setMessage('Service deleted');
                setServices(services.filter(s => s.id !== id && s._id !== id));
            } else {
                setError('Failed to delete service');
            }
        } catch (err) {
            setError('Error deleting service');
        }
    };

    // Render logic
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto p-6">
                {error && <div className="bg-red-500/20 text-red-400 p-4 rounded mb-6">{error}</div>}
                {message && <div className="bg-green-500/20 text-green-400 p-4 rounded mb-6">{message}</div>}

                {!company ? (
                    // ... existing company registration form ...
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
                        {/* Copy existing registration form code here if needed, or leave it intact if careful with line ranges */}
                        {/* For brevity in this tool call, I assume I'm replacing the wrapper and appending the new logic */}
                        {/* But since I'm replacing the whole file content effectively or large chunk... */}
                        {/* Actually, I should use replace_file_content TARGETING specific blocks to avoid deleting the form code accidentally. */}
                        {/* I will use the PREVIOUS code content for the form part. */}
                        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                            {/* ... Content skipped for this specific tool call explanation ... */}
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
                                <div className="mb-4">
                                    <ImageUpload
                                        label="Company Logo"
                                        maxImages={1}
                                        existingImages={logo}
                                        onImagesChange={setLogo}
                                    />
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <input type="checkbox" required id="terms" className="accent-orange-500" />
                                    <label htmlFor="terms" className="text-sm text-gray-400">
                                        I agree to the <Link to="/terms" className="text-orange-400 hover:underline">Terms & Conditions</Link>
                                    </label>
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
                            <button onClick={() => setActiveTab('bookings')} className={`pb-4 px-2 ${activeTab === 'bookings' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400 hover:text-white'}`}>Bookings ({bookings.filter(b => b.status === 'pending').length})</button>
                        </div>

                        {activeTab === 'overview' && (
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Company Details Card */}
                                <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                    <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                                        <h3 className="font-bold text-lg">Company Profile</h3>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(!isEditing)}
                                            className={`text-xs px-3 py-1.5 rounded-full transition ${isEditing ? 'bg-gray-700 text-white' : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'}`}
                                        >
                                            {isEditing ? 'Cancel' : 'Edit Details'}
                                        </button>
                                    </div>

                                    <form onSubmit={handleCompanySubmit} className="p-6">
                                        <div className="flex flex-col sm:flex-row gap-6 mb-6">
                                            <div className="flex-shrink-0 mx-auto sm:mx-0">
                                                {isEditing ? (
                                                    <div className="w-24">
                                                        <ImageUpload
                                                            label=""
                                                            maxImages={1}
                                                            existingImages={logo}
                                                            onImagesChange={setLogo}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-24 h-24 rounded-full border-2 border-gray-700 overflow-hidden bg-gray-900">
                                                        {logo[0]?.preview ? (
                                                            <img src={logo[0].preview} alt="Logo" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Logo</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-grow space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Company Name</label>
                                                        <input
                                                            type="text"
                                                            value={companyForm.name}
                                                            onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                                                            disabled={!isEditing}
                                                            className={`w-full p-2 rounded text-sm ${!isEditing ? 'bg-transparent border-none p-0 text-white font-medium text-lg' : 'bg-gray-700 focus:ring-1 focus:ring-orange-500'}`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Email (Read-Only)</label>
                                                        <input
                                                            type="email"
                                                            value={companyForm.email}
                                                            readOnly
                                                            disabled
                                                            className="w-full bg-transparent border-none p-0 text-gray-400 text-sm cursor-not-allowed"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Description</label>
                                                    <textarea
                                                        value={companyForm.description}
                                                        onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })}
                                                        disabled={!isEditing}
                                                        className={`w-full rounded text-sm ${!isEditing ? 'bg-transparent border-none p-0 text-gray-300 resize-none h-auto' : 'bg-gray-700 p-2 focus:ring-1 focus:ring-orange-500'}`}
                                                        rows={isEditing ? 3 : undefined}
                                                        style={{ minHeight: isEditing ? 'auto' : '1.5em' }}
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-700/50 pt-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Phone</label>
                                                <input
                                                    type="text"
                                                    value={companyForm.phone}
                                                    onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })}
                                                    disabled={!isEditing}
                                                    className={`w-full rounded text-sm ${!isEditing ? 'bg-transparent border-none p-0 text-gray-300' : 'bg-gray-700 p-2'}`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Website</label>
                                                <input
                                                    type="text"
                                                    value={companyForm.website}
                                                    onChange={e => setCompanyForm({ ...companyForm, website: e.target.value })}
                                                    disabled={!isEditing}
                                                    className={`w-full rounded text-sm ${!isEditing ? 'bg-transparent border-none p-0 text-blue-400' : 'bg-gray-700 p-2'}`}
                                                />
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="mt-6 flex justify-end">
                                                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-bold transition shadow-lg shadow-orange-500/20">
                                                    Save Changes
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>

                                {/* Sidebar Stats & Actions */}
                                <div className="space-y-6">
                                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                                        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4">Performance</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-700/30 p-3 rounded-lg text-center">
                                                <div className="text-2xl font-bold text-white">{services.length}</div>
                                                <div className="text-xs text-gray-500">Services</div>
                                            </div>
                                            <div className="bg-gray-700/30 p-3 rounded-lg text-center">
                                                <div className="text-2xl font-bold text-white">{bookings.length}</div>
                                                <div className="text-xs text-gray-500">Bookings</div>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                                            <span className="text-sm text-gray-400">Account Status</span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${company.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {company.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-800 rounded-xl border border-red-900/30 p-5">
                                        <h3 className="font-bold text-red-400/80 text-xs uppercase tracking-wider mb-3">Security</h3>
                                        <button
                                            onClick={logoutAll}
                                            className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            Logout from All Devices
                                        </button>
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

                        {activeTab === 'bookings' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold mb-6">Booking Requests</h2>
                                {bookings.length === 0 ? (
                                    <div className="text-center text-gray-500 py-12">No bookings yet</div>
                                ) : (
                                    bookings.map((booking) => (
                                        <div key={booking._id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col md:flex-row justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-1 text-xs rounded uppercase font-bold ${booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        booking.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                                                            booking.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-gray-700 text-gray-400'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                    <span className="text-gray-400 text-sm">{new Date(booking.date).toLocaleDateString()} at {new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-white mb-1">{booking.service?.title || 'Service Unavailable'}</h3>
                                                <p className="text-gray-400 text-sm mb-2">Customer: <span className="text-white">{booking.user?.name}</span> ({booking.user?.phone})</p>
                                                <p className="text-gray-400 text-sm">Location: <span className="text-white">{booking.address}</span></p>
                                                {booking.notes && (
                                                    <div className="mt-2 p-3 bg-gray-700/50 rounded text-sm text-gray-300">
                                                        "{booking.notes}"
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-start gap-2">
                                                {booking.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleBookingStatus(booking._id, 'accepted')}
                                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleBookingStatus(booking._id, 'rejected')}
                                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status === 'accepted' && (
                                                    <button
                                                        onClick={() => handleBookingStatus(booking._id, 'completed')}
                                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
                                                    >
                                                        Mark Completed
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
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
