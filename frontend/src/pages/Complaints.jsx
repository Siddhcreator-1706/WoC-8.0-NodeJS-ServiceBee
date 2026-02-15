import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ComplaintModal from '../components/ComplaintModal';
import CustomSelect from '../components/ui/CustomSelect';
import ImageModal from '../components/common/ImageModal';
import API_URL from '../config/api';

const Complaints = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchComplaints();

        // Check for bookingId or success in URL
        const bookingId = searchParams.get('bookingId');
        if (bookingId) {
            setShowForm(true);
        }

        if (searchParams.get('success')) {
            setShowSuccess(true);
            // Clear URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
            setTimeout(() => setShowSuccess(false), 5000);
        }
    }, [user, navigate, searchParams]);

    const fetchComplaints = async () => {
        try {
            const res = await fetch(`${API_URL}/api/complaints/me`, { credentials: 'include' });
            const data = await res.json();
            setComplaints(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
            // Log detail if available
            if (error.response) console.error('Error response:', await error.response.text());
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-400 bg-yellow-400/20';
            case 'in-progress': return 'text-blue-400 bg-blue-400/20';
            case 'awaiting-confirmation': return 'text-orange-400 bg-orange-400/20 border border-orange-400/50';
            case 'resolved': return 'text-green-400 bg-green-400/20';
            case 'rejected': return 'text-red-400 bg-red-400/20';
            case 'service-unavailable': return 'text-gray-400 bg-gray-400/20';
            default: return 'text-gray-400 bg-gray-400/20';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'service-unavailable': return 'Service Removed';
            default: return status;
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0f0f13] relative overflow-hidden font-sans text-gray-100">
            {/* Halloween Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-orange-900/20 rounded-full blur-[100px] opacity-30" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-gradient-to-t from-orange-900/10 to-transparent blur-3xl opacity-20" />
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-center items-center mb-12 gap-4">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-3 tracking-wide drop-shadow-[0_2px_4px_rgba(255,165,0,0.3)] font-creepster text-center"
                        >
                            Spooky Complaints
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-400 text-lg text-center"
                        >
                            Don't let your issues haunt you. We'll exorcise the bugs! 👻
                        </motion.p>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row justify-end">
                        <div className="relative z-20">
                            <CustomSelect
                                options={[
                                    { value: 'all', label: '🔮 All Apparitions' },
                                    { value: 'pending', label: '⏳ Pending Rituals' },
                                    { value: 'in-progress', label: '🧙‍♂️ In Casting' },
                                    { value: 'awaiting-confirmation', label: '🕯️ Awaiting Confirmation' },
                                    { value: 'resolved', label: '✨ Vanished (Resolved)' },
                                ]}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                placeholder="Filter Hauntings"
                            />
                        </div>
                    </div>

                    {/* Success Message Banner */}
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-green-500/20 border border-green-500/50 p-4 rounded-2xl flex items-center justify-between backdrop-blur-md"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🎃</span>
                                    <div>
                                        <h4 className="font-bold text-green-400">Complaint Registered!</h4>
                                        <p className="text-sm text-green-300/80">The spirits have heard your plea. We will exorcise this issue soon.</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowSuccess(false)} className="text-green-400/50 hover:text-green-400">✕</button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Content Area */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-gray-800 border-t-orange-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl animate-pulse">🎃</span>
                                </div>
                            </div>
                            <p className="text-orange-400/80 mt-6 animate-pulse font-medium tracking-widest text-sm uppercase">Summoning Records...</p>
                        </div>
                    ) : complaints.filter(c => filterStatus === 'all' || c.status === filterStatus).filter(c => c.status !== 'rejected').length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-24 bg-[#1a1a24]/30 rounded-3xl border border-dashed border-gray-800 backdrop-blur-sm text-center px-6"
                        >
                            <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/5">
                                <span className="text-5xl opacity-80">🕸️</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-200 mb-2">No Hauntings Here</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                The spirits are quiet properly handled. Your service history is spookily clean!
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid gap-6">
                            {complaints.filter(c => filterStatus === 'all' || c.status === filterStatus).filter(c => c.status !== 'rejected').map((complaint, index) => (
                                <motion.div
                                    key={complaint._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-[#15151e]/80 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-800 hover:border-orange-500/50 transition-all duration-300 shadow-xl group relative"
                                >
                                    {/* Spooky Texture Overlay */}
                                    {/* Spooky Texture Overlay Removed as per request */}

                                    <div className="flex flex-col relative z-10">
                                        {/* Status Bar (Top) */}
                                        <div className={`w-full h-1.5 flex-shrink-0 ${complaint.status === 'resolved' ? 'bg-gradient-to-r from-green-500 to-green-900' :
                                            complaint.status === 'awaiting-confirmation' ? 'bg-gradient-to-r from-orange-400 to-orange-700' :
                                                complaint.status === 'in-progress' ? 'bg-gradient-to-r from-purple-500 to-indigo-900' :
                                                    'bg-gradient-to-r from-yellow-500 to-orange-600'
                                            }`} />

                                        <div className="p-6 md:p-8 w-full">
                                            <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
                                                <div className="space-y-4 flex-1">
                                                    <div className="flex items-center flex-wrap gap-3">
                                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border ${complaint.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                                                            complaint.status === 'in-progress' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                                                                complaint.status === 'awaiting-confirmation' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 animate-pulse' :
                                                                    'bg-green-500/10 text-green-400 border-green-500/30'
                                                            }`}>
                                                            <span className="text-base">
                                                                {complaint.status === 'pending' ? '⏳' :
                                                                    complaint.status === 'in-progress' ? '🧙‍♂️' :
                                                                        complaint.status === 'awaiting-confirmation' ? '🕯️' : '✨'}
                                                            </span>
                                                            {getStatusLabel(complaint.status)}
                                                        </span>
                                                        <span className="text-gray-600 text-sm pl-2 font-mono">
                                                            ID: <span className="text-gray-500">#{complaint._id.slice(-6)}</span>
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-100 mb-2 group-hover:text-orange-400 transition-colors leading-tight">
                                                            {complaint.subject}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-sm text-gray-400 bg-black/40 w-fit px-4 py-2 rounded-lg border border-white/5 shadow-inner">
                                                            <span className="text-orange-500/70">Service:</span>
                                                            <span className="text-gray-300 font-medium">{complaint.service?.name || complaint.serviceSnapshot?.name || 'Unknown Service'}</span>
                                                            <span className="text-gray-700 mx-1">|</span>
                                                            <span>{new Date(complaint.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                {(complaint.status === 'awaiting-confirmation') && (
                                                    <button
                                                        onClick={async () => {
                                                            if (!window.confirm('Are you satisfied that the spirits are at rest? This will close the complaint.')) return;
                                                            try {
                                                                await axios.put(`/api/complaints/${complaint._id}/resolve?confirm=true`);
                                                                fetchComplaints();
                                                            } catch (err) {
                                                                console.error(err);
                                                            }
                                                        }}
                                                        className={`px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 whitespace-nowrap min-w-[200px] justify-center ${complaint.status === 'awaiting-confirmation'
                                                            ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02]'
                                                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500'
                                                            }`}
                                                    >
                                                        {complaint.status === 'awaiting-confirmation' ? (
                                                            <>
                                                                <span className="text-lg">🕯️</span>
                                                                Confirm Peace
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="opacity-50 text-lg">✨</span>
                                                                Mark as Resolved
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Message Content */}
                                            <div className="bg-[#0f0f13]/80 p-6 rounded-xl border border-gray-800 mb-6 shadow-inner">
                                                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed font-normal">
                                                    {complaint.message}
                                                </p>
                                            </div>

                                            {/* Evidence Section - Image Handling */}
                                            {complaint.images && complaint.images.length > 0 && (
                                                <div className="mb-8">
                                                    <h4 className="text-xs font-bold text-orange-500/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        Visual Evidence
                                                    </h4>
                                                    <div className="flex flex-wrap gap-3">
                                                        {complaint.images.map((img, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={() => setSelectedImage(img.url)}
                                                                className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-700 md:hover:border-orange-500 cursor-pointer transition-all group/img shadow-md"
                                                            >
                                                                <img
                                                                    src={img.url}
                                                                    alt={`Evidence ${idx + 1}`}
                                                                    className="w-full h-full object-cover transform md:group-hover/img:scale-110 transition-transform duration-500"
                                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; e.target.style.opacity = 0.5; }}
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Timeline/Responses */}
                                            {(complaint.serviceProviderResponse || complaint.adminResponse) && (
                                                <div className="space-y-4 pt-6 border-t border-gray-800 relative">

                                                    {complaint.serviceProviderResponse && (
                                                        <div className="pl-6 border-l-2 border-purple-500/30 relative">
                                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#15151e] border-2 border-purple-500 flex items-center justify-center">
                                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                                            </div>
                                                            <div className="bg-purple-500/5 rounded-xl border border-purple-500/10 p-5 ml-2 hover:bg-purple-500/10 transition-colors">
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <h5 className="font-bold text-purple-400 flex items-center gap-2">
                                                                        <span>🔮 Provider Response</span>
                                                                    </h5>
                                                                    {complaint.serviceProviderRespondedAt && (
                                                                        <span className="text-xs text-purple-400/50 font-mono">
                                                                            {new Date(complaint.serviceProviderRespondedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-gray-300 italic">"{complaint.serviceProviderResponse}"</p>

                                                                {complaint.status === 'awaiting-confirmation' && (
                                                                    <div className="mt-4 flex items-center gap-3 text-xs font-medium text-orange-200 bg-orange-900/40 py-2 px-3 rounded-lg border border-orange-500/30 w-fit">
                                                                        <span className="relative flex h-2 w-2">
                                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                                                        </span>
                                                                        Ritual Complete? Please confirm peace.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {complaint.adminResponse && (
                                                        <div className="pl-6 border-l-2 border-purple-500/30 relative">
                                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-800 border-2 border-purple-500 flex items-center justify-center">
                                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                                            </div>
                                                            <div className="bg-purple-500/5 rounded-xl border border-purple-500/10 p-5 ml-2">
                                                                <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                    <span>🛡️</span> Admin Note
                                                                </p>
                                                                <p className="text-gray-300">{complaint.adminResponse}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Image Modal */}
                <ImageModal
                    isOpen={Boolean(selectedImage)}
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />

                {showForm && (
                    <ComplaintModal
                        isOpen={showForm}
                        onClose={() => {
                            setShowForm(false);
                            // Clear URL params
                            const newUrl = window.location.pathname;
                            window.history.replaceState({}, '', newUrl);
                        }}
                        bookingId={searchParams.get('bookingId')}
                        onSuccess={() => {
                            fetchComplaints();
                            setShowForm(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default Complaints;
