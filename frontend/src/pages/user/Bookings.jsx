import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

import ComplaintModal from '../../components/user/ComplaintModal';
import CustomSelect from '../../components/ui/CustomSelect';

const Bookings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [selectedBookingForComplaint, setSelectedBookingForComplaint] = useState(null);

    const { socket } = useSocket();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchMyBookings();
    }, [user, navigate]);

    useEffect(() => {
        if (!socket) return;

        socket.on('booking:updated', (data) => {
            const { bookingId, status } = data;
            setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status } : b));
            // Show toast or message? functionality not in this component yet, maybe native alert or toast if available
        });

        return () => {
            socket.off('booking:updated');
        };
    }, [socket]);

    const fetchMyBookings = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/bookings/my-bookings');
            // API returns { bookings: [...], page, pages, total }
            const { data } = res;
            setBookings(Array.isArray(data) ? data : data.bookings || []);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReportIssue = (booking) => {
        setSelectedBookingForComplaint(booking);
        setShowComplaintModal(true);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0f0f13] py-12 px-6 relative overflow-hidden font-sans text-gray-100">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0f0f13] to-[#0f0f13]" />
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-orange-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="flex flex-col mb-10">
                        <div className="text-center mb-6">
                            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-2 font-creepster tracking-wide drop-shadow-[0_2px_4px_rgba(255,165,0,0.3)]">My Bookings</h1>
                            <p className="text-gray-400">Manage your spectral appointments and history</p>
                        </div>
                        <div className="flex justify-end">
                            <div className="w-48 relative z-20">
                                <CustomSelect
                                    options={[
                                        { value: 'all', label: 'All Status' },
                                        { value: 'pending', label: 'Pending' },
                                        { value: 'accepted', label: 'Accepted' },
                                        { value: 'completed', label: 'Completed' },
                                        { value: 'rejected', label: 'Rejected' },
                                    ]}
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    placeholder="Filter Status"
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(255,165,0,0.5)]"></div>
                            <p className="text-gray-400 animate-pulse font-creepster tracking-wider">Summoning bookings...</p>
                        </div>
                    ) : bookings.filter(b => filterStatus === 'all' || b.status === filterStatus).length > 0 ? (
                        <div className="grid gap-6">
                            {bookings.filter(b => filterStatus === 'all' || b.status === filterStatus).map((booking) => (
                                <motion.div
                                    key={booking._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-[#15151e]/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800 hover:border-orange-500/30 transition-all shadow-lg hover:shadow-orange-900/20 group relative"
                                >
                                    {/* Spooky Texture Overlay */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

                                    <div className="p-6 relative z-10">
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                                                    {booking.service?.name || 'Service Unavailable'}
                                                </h3>
                                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                    <span>by</span>
                                                    <span className="font-medium text-gray-300">{booking.company?.name || 'Unknown Provider'}</span>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 text-xs rounded-full uppercase font-bold tracking-wider border ${booking.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    booking.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-[#0a0a0f]/50 p-4 rounded-lg border border-gray-700/30">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p>
                                                <p className="text-gray-300 font-medium">{new Date(booking.date).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Time</p>
                                                <p className="text-gray-300 font-medium">{new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Price</p>
                                                <p className="text-gray-300 font-medium">₹{booking.service?.price}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</p>
                                                <p className="text-gray-300 font-medium truncate" title={booking.address}>{booking.address}</p>
                                            </div>
                                        </div>

                                        {booking.notes && (
                                            <div className="mb-4 bg-[#0a0a0f] p-3 rounded-lg border-l-2 border-gray-600">
                                                <p className="text-sm text-gray-400 italic">"{booking.notes}"</p>
                                            </div>
                                        )}

                                        {['completed', 'accepted'].includes(booking.status) && (
                                            <div className="flex justify-end pt-4 border-t border-gray-800">
                                                <button
                                                    onClick={() => handleReportIssue(booking)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    Report Issue
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-[#15151e]/30 rounded-2xl border border-dashed border-gray-800">
                            <div className="text-8xl mb-6 drop-shadow-[0_0_15px_rgba(255,165,0,0.5)] animate-bounce">👻</div>
                            <h3 className="text-2xl font-bold text-gray-300 mb-2 font-creepster tracking-wider">Empty as a Crypt</h3>
                            <p className="text-gray-500 text-sm max-w-md text-center mb-6">
                                You haven't summoned any services yet. Check the Necronomicon (Services page) to get started!
                            </p>
                            <button
                                onClick={() => navigate('/user/services')}
                                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-900/40 transform hover:scale-105"
                            >
                                Browse Services
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Complaint Modal */}
            <ComplaintModal
                isOpen={showComplaintModal}
                onClose={() => setShowComplaintModal(false)}
                booking={selectedBookingForComplaint}
                onSuccess={() => {
                    setShowComplaintModal(false);
                    fetchMyBookings();
                }}
            />
        </div>
    );
};

export default Bookings;
