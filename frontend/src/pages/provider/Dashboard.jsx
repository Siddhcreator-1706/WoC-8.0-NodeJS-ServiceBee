import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ImageUpload from '../../components/ImageUpload';
import API_URL from '../../config/api';

// Provider Dashboard Component
const Dashboard = () => {
    const { user, logout, logoutAll } = useAuth();
    const [company, setCompany] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');

    // activeTab initial state is derived from URL, defaulting to 'profile'
    const [activeTab, setActiveTab] = useState(tabParam || 'profile');
    const [logo, setLogo] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [serviceImage, setServiceImage] = useState([]); // New state for service image
    const [submitting, setSubmitting] = useState(false); // Loading state for form submissions

    // Sync state with URL changes
    useEffect(() => {
        if (tabParam && ['profile', 'services', 'bookings', 'complaints'].includes(tabParam)) {
            setActiveTab(tabParam);
        } else if (!tabParam) {
            setActiveTab('profile'); // Default to profile if no tab specified
        }
    }, [tabParam]);

    // Auto-dismiss messages after 3 seconds
    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => {
                setMessage('');
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, error]);

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
    const [editingServiceId, setEditingServiceId] = useState(null);

    const [bookings, setBookings] = useState([]);
    const [complaints, setComplaints] = useState([]);

    useEffect(() => {
        fetchCompany();
    }, []);

    useEffect(() => {
        if (company) {
            fetchBookings();
            fetchComplaints();
        }
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

    const fetchComplaints = async () => {
        try {
            const res = await fetch(`${API_URL}/api/complaints/my-services`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setComplaints(data || []);
            }
        } catch (err) {
            console.error('Failed to fetch complaints', err);
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
                setMessage(`Booking ${status} `);
            }
        } catch (err) {
            setError('Failed to update booking');
        }
    };

    const handleComplaintResponse = async (id, response, markResolved) => {
        try {
            const res = await fetch(`${API_URL}/api/complaints/${id}/respond`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ response, markResolved })
            });

            if (res.ok) {
                const updatedComplaint = await res.json();
                setComplaints(complaints.map(c => c._id === id ? updatedComplaint : c));
                setMessage('Response sent successfully');
                return true;
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to send response');
                return false;
            }
        } catch (err) {
            setError('Failed to send response');
            return false;
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
        setSubmitting(true);
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
                setIsEditing(false);
                fetchCompany(); // Refresh to ensure strict sync
            } else {
                const data = await res.json();
                setError(data.message || 'Operation failed');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const method = editingServiceId ? 'PUT' : 'POST';
            const url = editingServiceId
                ? `${API_URL}/api/services/${editingServiceId}`
                : `${API_URL}/api/services`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(serviceForm)
            });

            if (res.ok) {
                const data = await res.json();
                const serviceId = data._id || data.id;

                // Handle Image Upload if exists
                if (serviceImage.length > 0 && serviceImage[0] instanceof File) {
                    const formData = new FormData();
                    formData.append('image', serviceImage[0]);

                    const imgRes = await fetch(`${API_URL}/api/services/${serviceId}/image`, {
                        method: 'POST',
                        credentials: 'include',
                        body: formData
                    });

                    if (!imgRes.ok) {
                        const imgData = await imgRes.json();
                        setError(`Service saved but image upload failed: ${imgData.message}`);
                        // Wait a bit then close
                        setTimeout(() => {
                            setShowServiceModal(false);
                            setEditingServiceId(null);
                            fetchCompany();
                        }, 2000);
                        return;
                    }
                }

                setMessage(editingServiceId ? 'Service updated successfully!' : 'Service created successfully!');
                setShowServiceModal(false);
                setEditingServiceId(null);
                setServiceImage([]); // Reset image
                fetchCompany(); // Refresh services
                setServiceForm({
                    name: '', description: '', price: '', priceType: 'fixed',
                    category: 'other', duration: '', location: '', tags: ''
                });
            } else {
                setError('Failed to save service');
            }
        } catch (err) {
            setError('Error saving service');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditService = (service) => {
        setServiceForm({
            name: service.name,
            description: service.description,
            price: service.price,
            priceType: service.priceType,
            category: service.category,
            duration: service.duration || '',
            location: service.location || '',
            tags: service.tags ? service.tags.join(', ') : ''
        });

        // Handle existing image for preview
        if (service.image) {
            setServiceImage([{ preview: service.image }]);
        } else {
            setServiceImage([]);
        }

        setEditingServiceId(service._id || service.id);
        setShowServiceModal(true);
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
    if (loading || (user?.company && !company)) {
        return (
            <div className="min-h-screen bg-[#0f0f13] text-white flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-orange-900/20 rounded-full blur-[100px] opacity-30" />
                </div>
                <div className="text-orange-500 text-xl font-bold animate-pulse relative z-10 font-creepster tracking-widest">
                    Summoning Dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f13] text-gray-100 font-sans relative overflow-hidden pt-24">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0f0f13] to-[#0f0f13]" />
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-orange-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto p-6 relative z-10 ">
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 backdrop-blur-md">
                            ⚠️ {error}
                        </motion.div>
                    )}
                    {message && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl mb-6 backdrop-blur-md">
                            ✨ {message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {!company && !user.company ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
                        <div className="bg-[#15151e]/80 backdrop-blur-md rounded-2xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
                            <h2 className="text-2xl font-bold mb-6 text-center text-white font-creepster tracking-wide">Register Your Coven</h2>
                            <form onSubmit={handleCompanySubmit} className="space-y-4 relative z-10">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                                    <input type="text" required value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                                    <textarea value={companyForm.description} onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" rows="3"></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Business Email</label>
                                        <input type="email" required value={companyForm.email} onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Phone</label>
                                        <input type="text" value={companyForm.phone} onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
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
                                    <input type="checkbox" required id="terms" className="accent-orange-500 w-4 h-4" />
                                    <label htmlFor="terms" className="text-sm text-gray-400">
                                        I agree to the <Link to="/terms" target="_blank" className="text-orange-400 hover:underline">Terms & Conditions</Link>
                                    </label>
                                </div>
                                <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-orange-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                                    {submitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : 'Register As Provider'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Profile/Overview Content */}
                        {activeTab === 'profile' && (
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-[#15151e]/80 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden mb-8 shadow-xl">
                                    <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0a0a0f]/50">
                                        <h2 className="text-xl font-bold text-white">Company Details</h2>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(!isEditing)}
                                            className={`px-4 py-2 rounded-lg font-bold transition-all ${isEditing
                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg shadow-orange-900/20'}`}
                                        >
                                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                        </button>
                                    </div>

                                    <form onSubmit={handleCompanySubmit} className="p-8">
                                        <div className="flex flex-col md:flex-row gap-8">
                                            {/* Left: Logo */}
                                            <div className="flex-shrink-0 md:w-1/3 flex flex-col items-center">
                                                {isEditing ? (
                                                    <div className="w-full">
                                                        <ImageUpload
                                                            label="Update Logo"
                                                            maxImages={1}
                                                            existingImages={logo}
                                                            onImagesChange={setLogo}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-40 h-40 rounded-full border-4 border-[#252530] overflow-hidden bg-[#0a0a0f] shadow-lg shadow-orange-900/20">
                                                        {logo[0]?.preview ? (
                                                            <img src={logo[0].preview} alt="Logo" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">No Logo</div>
                                                        )}
                                                    </div>
                                                )}

                                                {!isEditing && (
                                                    <div className="mt-6 w-full grid grid-cols-2 gap-4">
                                                        <div className="bg-[#0a0a0f]/50 p-3 rounded-xl text-center border border-gray-800">
                                                            <div className="text-2xl font-bold text-white">{services.length}</div>
                                                            <div className="text-xs text-gray-400 uppercase tracking-wider">Services</div>
                                                        </div>
                                                        <div className="bg-[#0a0a0f]/50 p-3 rounded-xl text-center border border-gray-800">
                                                            <div className="text-2xl font-bold text-white">{bookings.length}</div>
                                                            <div className="text-xs text-gray-400 uppercase tracking-wider">Bookings</div>
                                                        </div>
                                                        <div className="bg-[#0a0a0f]/50 p-3 rounded-xl text-center border border-gray-800 col-span-2">
                                                            <div className="text-2xl font-bold text-yellow-500">
                                                                {(() => {
                                                                    const totalRatingSum = services.reduce((acc, s) => acc + (s.ratings?.reduce((sum, r) => sum + r.value, 0) || 0), 0);
                                                                    const totalRatingsCount = services.reduce((acc, s) => acc + (s.ratings?.length || 0), 0);
                                                                    return totalRatingsCount ? (totalRatingSum / totalRatingsCount).toFixed(1) : 'New';
                                                                })()}
                                                            </div>
                                                            <div className="text-xs text-gray-400 uppercase tracking-wider">Avg Rating</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: Details */}
                                            <div className="flex-grow md:w-2/3 space-y-6">
                                                {isEditing ? (
                                                    // Edit Mode Form
                                                    <>
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                                                            <input type="text" value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 text-white" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-1">Description</label>
                                                            <textarea value={companyForm.description} onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 text-white h-32"></textarea>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm text-gray-400 mb-1">Email (Read-Only)</label>
                                                                <input type="email" value={companyForm.email} disabled className="w-full bg-[#0a0a0f]/50 text-gray-500 border border-gray-800 rounded-lg p-3 cursor-not-allowed" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                                                                <input type="text" value={companyForm.phone} onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 text-white" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-1">Website</label>
                                                            <input type="text" value={companyForm.website} onChange={e => setCompanyForm({ ...companyForm, website: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 text-white" />
                                                        </div>
                                                        <div className="flex justify-end pt-4">
                                                            <button type="submit" disabled={submitting} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center gap-2">
                                                                {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                                                Save Changes
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    // Read-Only View (Clean)
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h1 className="text-3xl font-bold text-white mb-2">{companyForm.name}</h1>
                                                            {companyForm.description && <p className="text-gray-400 leading-relaxed">{companyForm.description}</p>}
                                                        </div>

                                                        <div className="space-y-3 pt-4 border-t border-gray-700/50">
                                                            <div className="flex items-center gap-3 text-gray-300">
                                                                <span className="w-6 flex justify-center text-orange-400">✉️</span>
                                                                <span>{companyForm.email}</span>
                                                            </div>
                                                            {companyForm.phone && (
                                                                <div className="flex items-center gap-3 text-gray-300">
                                                                    <span className="w-6 flex justify-center text-orange-400">📞</span>
                                                                    <span>{companyForm.phone}</span>
                                                                </div>
                                                            )}
                                                            {companyForm.website && (
                                                                <div className="flex items-center gap-3 text-gray-300">
                                                                    <span className="w-6 flex justify-center text-orange-400">🌐</span>
                                                                    <a href={companyForm.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{companyForm.website}</a>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="pt-4 mt-4">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${company.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                                                                {company.isActive ? 'Account Active' : 'Account Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {/* Logout Button (User Profile Style) */}
                                <div className="mt-8 border-t border-gray-800 pt-8">
                                    <button
                                        onClick={logoutAll}
                                        className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20 font-medium flex items-center justify-center gap-2 group"
                                    >
                                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Logout from All Devices
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'services' && (
                            <div>
                                <div className="flex flex-col mb-10">
                                    <div className="text-center mb-6">
                                        <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-2 font-creepster tracking-wide drop-shadow-[0_2px_4px_rgba(255,165,0,0.3)]">Your Services</h2>
                                        <p className="text-gray-400">Manage your spectral offerings and rituals</p>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => {
                                                setEditingServiceId(null);
                                                setServiceImage([]); // Reset image
                                                setServiceForm({
                                                    name: '', description: '', price: '', priceType: 'fixed',
                                                    category: 'other', duration: '', location: '', tags: ''
                                                });
                                                setShowServiceModal(true);
                                            }}
                                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-orange-900/30 transition-all font-bold group"
                                        >   
                                            <span>Add Service</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Service Modal */}
                                <AnimatePresence>
                                    {showServiceModal && (
                                        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 mt-24 sm:p-6">
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                                                onClick={() => setShowServiceModal(false)}
                                            />

                                            <motion.div
                                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                                className="relative w-full max-w-2xl bg-[#15151e]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
                                                style={{ boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <div className="p-6 pb-0 flex justify-between items-start">
                                                    <div className="w-8"></div> {/* Spacer for centering */}
                                                    <h3 className="text-3xl font-bold text-center font-creepster tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500 flex-1">
                                                        {editingServiceId ? 'Edit Service' : 'Add Service'}
                                                    </h3>
                                                    <button onClick={() => setShowServiceModal(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg w-8 h-8 flex items-center justify-center">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>

                                                <div className="p-6 overflow-y-auto custom-scrollbar ">
                                                    <form onSubmit={handleServiceSubmit} className="space-y-5">
                                                        <div>
                                                            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Service Name</label>
                                                            <input required type="text" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} className="w-full p-3.5 bg-black/40 rounded-xl text-white border border-white/10 focus:border-orange-500 outline-none transition-colors placeholder:text-gray-600" placeholder="e.g. Cleansing Ritual" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Description</label>
                                                            <textarea required value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full p-3.5 bg-black/40 rounded-xl text-white border border-white/10 focus:border-orange-500 outline-none transition-colors placeholder:text-gray-600 resize-none" rows="3" placeholder="Describe your service..."></textarea>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Price (₹)</label>
                                                                <input required type="number" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} className="w-full p-3.5 bg-black/40 rounded-xl text-white border border-white/10 focus:border-orange-500 outline-none transition-colors" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Category</label>
                                                                <select value={serviceForm.category} onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })} className="w-full p-3.5 bg-black/40 rounded-xl text-white border border-white/10 focus:border-orange-500 outline-none transition-colors appearance-none cursor-pointer">
                                                                    <option value="other">Other</option>
                                                                    <option value="ritual">Ritual</option>
                                                                    <option value="cleansing">Cleansing</option>
                                                                    <option value="exorcism">Exorcism</option>
                                                                    <option value="divination">Divination</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Duration</label>
                                                                <input type="text" value={serviceForm.duration} onChange={e => setServiceForm({ ...serviceForm, duration: e.target.value })} className="w-full p-3.5 bg-black/40 rounded-xl text-white border border-white/10 focus:border-orange-500 outline-none transition-colors" placeholder="e.g. 2 hours" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Location</label>
                                                                <input type="text" value={serviceForm.location} onChange={e => setServiceForm({ ...serviceForm, location: e.target.value })} className="w-full p-3.5 bg-black/40 rounded-xl text-white border border-white/10 focus:border-orange-500 outline-none transition-colors" placeholder="e.g. Haunted Mansion" />
                                                            </div>
                                                        </div>

                                                        {/* Service Image Upload */}
                                                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                                            <ImageUpload
                                                                label="Service Image (Optional)"
                                                                maxImages={1}
                                                                existingImages={serviceImage}
                                                                onImagesChange={setServiceImage}
                                                            />
                                                        </div>

                                                        <div className="flex gap-4 pt-4 border-t border-white/5">
                                                            <button type="button" onClick={() => setShowServiceModal(false)} className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors font-medium border border-white/5">Cancel</button>
                                                            <button type="submit" disabled={submitting} className="flex-1 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-900/20 disabled:opacity-50 flex justify-center items-center gap-2 border border-orange-500/20">
                                                                {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                                                {editingServiceId ? 'Update Service' : 'Create Service'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </motion.div>
                                        </div>
                                    )}
                                </AnimatePresence>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {services.map(service => (
                                        <motion.div key={service.id} layout className="bg-[#15151e]/80 backdrop-blur-md rounded-xl overflow-hidden border border-gray-800 hover:border-orange-500/50 group transition-all duration-300">
                                            <div className="h-32 bg-[#0a0a0f] relative overflow-hidden">
                                                {service.image && <img src={service.image} alt={service.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#15151e] to-transparent"></div>
                                                <div className="absolute top-2 right-2 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEditService(service)} className="bg-blue-600/80 text-white p-2 rounded-full hover:bg-blue-500 backdrop-blur-sm shadow-lg">✏️</button>
                                                    <button onClick={() => handleDeleteService(service.id)} className="bg-red-600/80 text-white p-2 rounded-full hover:bg-red-500 backdrop-blur-sm shadow-lg">🗑</button>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="font-bold text-lg mb-1 text-white group-hover:text-orange-400 transition-colors">{service.name}</h3>
                                                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{service.description}</p>
                                                <div className="flex justify-between items-center border-t border-gray-800 pt-3">
                                                    <span className="text-orange-400 font-bold bg-orange-400/10 px-2 py-1 rounded-md">₹{service.price}</span>
                                                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">{service.category}</span>
                                                </div>
                                                <div className="mt-2 flex items-center text-yellow-500 text-sm">
                                                    <span className="mr-1">★</span>
                                                    <span>{service.averageRating ? service.averageRating.toFixed(1) : 'New'}</span>
                                                    <span className="text-gray-500 text-xs ml-1">({service.ratings?.length || 0})</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'bookings' && (
                            <div className="space-y-4">
                                <div className="flex flex-col mb-10">
                                    <div className="text-center mb-6">
                                        <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-2 font-creepster tracking-wide drop-shadow-[0_2px_4px_rgba(255,165,0,0.3)]">Booking Requests</h2>
                                        <p className="text-gray-400">Respond to mortal summons and inquiries</p>
                                    </div>
                                    <div className="flex justify-end">
                                        <div className="relative group">
                                            <select
                                                className="appearance-none bg-[#15151e] text-gray-300 text-sm py-2 px-4 pr-10 rounded-lg border border-gray-700 outline-none focus:border-orange-500 cursor-pointer shadow-lg"
                                                onChange={(e) => {
                                                    const status = e.target.value;
                                                    setBookings(bookings.map(b => ({ ...b, hidden: status !== 'all' && b.status !== status })));
                                                }}
                                            >
                                                <option value="all">All Status</option>
                                                <option value="pending">Pending</option>
                                                <option value="accepted">Accepted</option>
                                                <option value="completed">Completed</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {bookings.filter(b => !b.hidden).length === 0 ? (
                                    <div className="text-center text-gray-500 py-12 bg-[#15151e]/50 rounded-xl border border-dashed border-gray-800">No bookings found</div>
                                ) : (
                                    bookings.filter(b => !b.hidden).map((booking) => (
                                        <div key={booking._id} className="bg-[#15151e]/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-orange-500/30 transition-all flex flex-col md:flex-row justify-between gap-4 shadow-lg">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-1 text-xs rounded uppercase font-bold border ${booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                        booking.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                            booking.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                    <span className="text-gray-400 text-sm">{new Date(booking.date).toLocaleDateString()} at {new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-white mb-1">{booking.service?.title || 'Service Unavailable'}</h3>
                                                <p className="text-gray-400 text-sm mb-2">Customer: <span className="text-white">{booking.user?.name}</span> ({booking.user?.phone})</p>
                                                <p className="text-gray-400 text-sm">Location: <span className="text-white">{booking.address}</span></p>
                                                {booking.notes && (
                                                    <div className="mt-2 p-3 bg-[#0a0a0f] rounded text-sm text-gray-300 border border-gray-800 italic">
                                                        "{booking.notes}"
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-start gap-2">
                                                {booking.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleBookingStatus(booking._id, 'accepted')}
                                                            className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-lg text-sm font-medium transition-all"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleBookingStatus(booking._id, 'rejected')}
                                                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status === 'accepted' && (
                                                    <button
                                                        onClick={() => handleBookingStatus(booking._id, 'completed')}
                                                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-lg text-sm font-medium transition-all"
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

                        {activeTab === 'complaints' && (
                            <div className="space-y-6">
                                <div className="flex flex-col mb-10">
                                    <div className="text-center mb-6">
                                        <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-2 font-creepster tracking-wide drop-shadow-[0_2px_4px_rgba(255,165,0,0.3)]">Customer Complaints</h2>
                                        <p className="text-gray-400">Manage and resolve issues reported by your customers</p>
                                    </div>

                                    <div className="flex justify-end">
                                        <div className="relative group z-20">
                                            <select
                                                className="appearance-none bg-[#15151e] text-gray-300 text-sm py-2 px-4 pr-10 rounded-lg border border-gray-700 outline-none focus:border-orange-500 cursor-pointer shadow-lg"
                                                onChange={(e) => {
                                                    const status = e.target.value;
                                                    setComplaints(complaints.map(c => ({
                                                        ...c,
                                                        hidden: status !== 'All' && c.status !== status.toLowerCase().replace(' ', '-')
                                                    })));
                                                }}
                                            >
                                                <option>All</option>
                                                <option>Pending</option>
                                                <option>In-Progress</option>
                                                <option>Resolved</option>
                                                <option>Rejected</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {complaints.filter(c => !c.hidden).length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 bg-[#15151e]/30 rounded-2xl border border-dashed border-gray-800">
                                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 text-3xl">👍</div>
                                        <h3 className="text-xl font-bold text-gray-300">No active complaints</h3>
                                        <p className="text-gray-500 text-sm mt-1">Great job! Your customers are happy.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        {complaints.filter(c => !c.hidden).map((complaint) => (
                                            <motion.div
                                                key={complaint._id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-[#15151e]/90 backdrop-blur-md rounded-xl overflow-hidden border border-gray-800 hover:border-orange-500/40 transition-all shadow-xl group"
                                            >
                                                <div className="flex flex-col md:flex-row">
                                                    {/* Status indicator strip */}
                                                    <div className={`md:w-1.5 h-1.5 md:h-auto w-full flex-shrink-0 ${complaint.status === 'resolved' ? 'bg-gradient-to-b from-green-500 to-green-900' :
                                                        complaint.status === 'rejected' ? 'bg-gradient-to-b from-red-500 to-red-900' :
                                                            complaint.status === 'in-progress' ? 'bg-gradient-to-b from-blue-500 to-blue-900' :
                                                                'bg-gradient-to-b from-yellow-500 to-yellow-900'
                                                        }`} />

                                                    <div className="p-6 w-full">
                                                        {/* Header */}
                                                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4 pb-4 border-b border-gray-800">
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${complaint.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                                        complaint.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                            complaint.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                                                        }`}>
                                                                        {complaint.status}
                                                                    </span>
                                                                    <span className="text-gray-500 text-sm flex items-center gap-1">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">{complaint.subject}</h3>
                                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                                    <span className="bg-[#0a0a0f] border border-gray-700 px-2 py-0.5 rounded text-gray-300">{complaint.service?.name || 'Service'}</span>
                                                                    {complaint.booking && (
                                                                        <span>• Booking Date: {new Date(complaint.booking.date).toLocaleDateString()}</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3 bg-[#0a0a0f] p-3 rounded-lg border border-gray-800 min-w-[200px]">
                                                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg">
                                                                    👤
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-white text-sm">{complaint.user?.name}</p>
                                                                    <p className="text-xs text-gray-400">{complaint.user?.email}</p>
                                                                    {complaint.user?.phone && <p className="text-xs text-gray-500">{complaint.user.phone}</p>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Content */}
                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            <div className="space-y-4">
                                                                <div className="bg-[#0a0a0f]/50 p-4 rounded-lg border border-gray-800">
                                                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Complaint Details</h4>
                                                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{complaint.message}</p>
                                                                </div>

                                                                {complaint.images && complaint.images.length > 0 && (
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Evidence</h4>
                                                                        <div className="flex gap-2">
                                                                            {complaint.images.map((img, idx) => (
                                                                                <div
                                                                                    key={idx}
                                                                                    onClick={() => setSelectedImage(img.url)}
                                                                                    className="block w-16 h-16 rounded-lg overflow-hidden border border-gray-700 hover:border-orange-500 cursor-pointer transition-colors"
                                                                                >
                                                                                    <img src={img.url} alt="Evidence" className="w-full h-full object-cover" />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Actions / Response */}
                                                            <div className="border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6">
                                                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                                                    <span>💬</span> Resolution & Response
                                                                </h4>

                                                                {['resolved', 'awaiting-confirmation'].includes(complaint.status) ? (
                                                                    <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                                                                        <div className="flex items-center gap-2 mb-2 text-green-400 font-bold">
                                                                            <span className="bg-green-500/20 p-1 rounded-full"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span>
                                                                            <span>{complaint.status === 'resolved' ? 'Resolved Successfully' : 'Resolution Pending Confirmation'}</span>
                                                                        </div>
                                                                        {complaint.serviceProviderResponse && (
                                                                            <div className="mt-2 text-sm">
                                                                                <span className="text-gray-500 text-xs uppercase">Your Response:</span>
                                                                                <p className="text-gray-300 italic mt-1">"{complaint.serviceProviderResponse}"</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-3">
                                                                        <textarea
                                                                            className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-orange-500 outline-none"
                                                                            rows="3"
                                                                            placeholder="Type your response to the customer..."
                                                                            id={`response-${complaint._id}`}
                                                                        ></textarea>
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => {
                                                                                    const response = document.getElementById(`response-${complaint._id}`).value;
                                                                                    if (response.trim()) handleComplaintResponse(complaint._id, response, false);
                                                                                }}
                                                                                className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 py-2 rounded-lg text-sm font-bold transition-all"
                                                                            >
                                                                                Send Reply
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    const response = document.getElementById(`response-${complaint._id}`).value;
                                                                                    handleComplaintResponse(complaint._id, response || 'Issue resolved', true);
                                                                                }}
                                                                                className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 py-2 rounded-lg text-sm font-bold transition-all"
                                                                            >
                                                                                Resolve & Close
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Image Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <ImageModal
                        imageUrl={selectedImage}
                        onClose={() => setSelectedImage(null)}
                    />
                )}
            </AnimatePresence>
        </div >
    );
};

export default Dashboard;
