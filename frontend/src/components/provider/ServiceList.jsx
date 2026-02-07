import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '../ImageUpload';
import API_URL from '../../config/api';

const ServiceList = ({ services, onUpdate }) => {
    const [serviceForm, setServiceForm] = useState({
        name: '', description: '', price: '', priceType: 'fixed',
        category: 'other', duration: '', location: ''
    });
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState(null);
    const [serviceImage, setServiceImage] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setMessage('');

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
                        // Keep modal open or close? Let's close after delay
                        setTimeout(() => {
                            setShowServiceModal(false);
                            setEditingServiceId(null);
                            onUpdate();
                        }, 2000);
                        return;
                    }
                }

                setMessage(editingServiceId ? 'Service updated successfully!' : 'Service created successfully!');
                setShowServiceModal(false);
                setEditingServiceId(null);
                setServiceImage([]);
                if (onUpdate) onUpdate();
                setServiceForm({
                    name: '', description: '', price: '', priceType: 'fixed',
                    category: 'other', duration: '', location: ''
                });
            } else {
                setError('Failed to save service');
            }
        } catch (err) {
            setError('Error saving service');
            console.error(err);
        } finally {
            setSubmitting(false);
            // Clear messages after delay
            setTimeout(() => { setError(''); setMessage(''); }, 3000);
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
            location: service.location || ''
        });

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
                if (onUpdate) onUpdate();
            } else {
                setError('Failed to delete service');
            }
        } catch (err) {
            setError('Error deleting service');
        }
    };

    return (
        <div>
            {/* Messages */}
            <AnimatePresence>
                {(error || message) && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`p-4 rounded-xl mb-6 backdrop-blur-md text-center border ${error ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                        {error ? `⚠️ ${error}` : `✨ ${message}`}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col mb-10">
                <div className="text-center mb-6">
                    <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-2 font-creepster tracking-wide drop-shadow-[0_2px_4px_rgba(255,165,0,0.3)]">Your Services</h2>
                    <p className="text-gray-400">Manage your spectral offerings and rituals</p>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={() => {
                            setEditingServiceId(null);
                            setServiceImage([]);
                            setServiceForm({
                                name: '', description: '', price: '', priceType: 'fixed',
                                category: 'other', duration: '', location: ''
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
                                <div className="w-8"></div>
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
    );
};

export default ServiceList;
