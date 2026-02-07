import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageModal from '../ImageModal';
import API_URL from '../../config/api';

const ComplaintList = () => {
    const [complaints, setComplaints] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchComplaints();
    }, []);

    // Auto-dismiss messages
    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => { setMessage(''); setError(''); }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, error]);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/complaints/my-services`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setComplaints(data || []);
            } else {
                // Silently fail or minimal error if just emptiness, but here likely error
                console.error('Failed to fetch complaints');
            }
        } catch (err) {
            console.error('Failed to fetch complaints', err);
        } finally {
            setLoading(false);
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
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to send response');
            }
        } catch (err) {
            setError('Failed to send response');
        }
    };

    const filteredComplaints = complaints.filter(c =>
        filterStatus === 'All' || c.status === filterStatus.toLowerCase().replace(' ', '-')
    );

    if (loading) return <div className="text-center py-10 text-gray-400">Loading complaints...</div>;

    return (
        <div className="space-y-6">
            {/* Messages */}
            {(error || message) && (
                <div className={`p-4 rounded-xl mb-6 backdrop-blur-md text-center border ${error ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                    {error ? `⚠️ ${error}` : `✨ ${message}`}
                </div>
            )}

            <div className="flex flex-col mb-10">
                <div className="text-center mb-6">
                    <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-2 font-creepster tracking-wide drop-shadow-[0_2px_4px_rgba(255,165,0,0.3)]">Customer Complaints</h2>
                    <p className="text-gray-400">Manage and resolve issues reported by your customers</p>
                </div>

                <div className="flex justify-end">
                    <div className="relative group z-20">
                        <select
                            className="appearance-none bg-[#15151e] text-gray-300 text-sm py-2 px-4 pr-10 rounded-lg border border-gray-700 outline-none focus:border-orange-500 cursor-pointer shadow-lg"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
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

            {filteredComplaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-[#15151e]/30 rounded-2xl border border-dashed border-gray-800">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 text-3xl">👍</div>
                    <h3 className="text-xl font-bold text-gray-300">No complaints found</h3>
                    <p className="text-gray-500 text-sm mt-1">Great job! Your customers are happy.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredComplaints.map((complaint) => (
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

            {/* Image Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <ImageModal
                        imageUrl={selectedImage}
                        onClose={() => setSelectedImage(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ComplaintList;
