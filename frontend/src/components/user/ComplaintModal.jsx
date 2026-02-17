import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config/api';
import ImageUpload from '../common/ImageUpload';

const ComplaintModal = ({ isOpen, onClose, bookingId, booking, onSuccess }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ subject: '', message: '' });
    const [images, setImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setFormData({ subject: '', message: '' });
            setImages([]);
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const formPayload = new FormData();
            formPayload.append('bookingId', bookingId || booking?._id);
            formPayload.append('subject', formData.subject);
            formPayload.append('message', formData.message);
            images.forEach(img => formPayload.append('images', img));

            // Axios automatically sets Content-Type to multipart/form-data for FormData
            const res = await axios.post(`${API_URL}/api/complaints`, formPayload);

            if (onSuccess) onSuccess(res.data);
            onClose();
            navigate('/user/complaints?success=true');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to submit complaint');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 100 }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#15151e]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        style={{ boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}
                        data-lenis-prevent
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                            <div>
                                <h3 className="text-2xl font-bold text-white font-creepster tracking-wide">Report an Issue</h3>
                                <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                                    <span className="text-orange-400 font-bold">Booking:</span>
                                    <span>{booking?.service?.name || 'Service'}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                                    <span>{new Date(booking?.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="complaintForm" onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20 flex items-center gap-2">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2">Subject</label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="Briefly summarize the issue"
                                        required
                                        minLength={5}
                                        maxLength={100}
                                        className="w-full p-3.5 bg-black/40 rounded-xl text-white border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all placeholder:text-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2">Detailed Description</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Provide as much detail as possible..."
                                        required
                                        minLength={20}
                                        maxLength={1000}
                                        rows="5"
                                        className="w-full p-3.5 bg-black/40 rounded-xl text-white border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all placeholder:text-gray-600 resize-none"
                                    />
                                </div>

                                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                    <ImageUpload
                                        onImagesChange={setImages}
                                        maxImages={3}
                                        label="Attach Evidence (Recommended)"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 bg-black/20 gap-3 flex">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3.5 bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 transition-colors font-medium border border-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="complaintForm"
                                disabled={submitting}
                                className="flex-1 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-orange-900/20 border border-orange-500/20"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Summoning...
                                    </span>
                                ) : 'Submit Complaint'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ComplaintModal;
