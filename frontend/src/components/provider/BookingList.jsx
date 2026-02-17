import React, { useState, useEffect } from 'react';
import CustomSelect from '../ui/CustomSelect';
import API_URL from '../../config/api';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';

const BookingList = () => {
    const [bookings, setBookings] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [processingId, setProcessingId] = useState(null);

    const { socket } = useSocket();

    useEffect(() => {
        fetchBookings();
    }, []);

    // Socket listeners for real-time updates
    useEffect(() => {
        if (!socket) return;

        socket.on('booking:new', (data) => {
            const { userName } = data;
            setMessage(`New booking request from ${userName}! 🔔`);
            fetchBookings();
        });

        socket.on('booking:cancelled', (data) => {
            const { bookingId, userName } = data;
            setMessage(`Booking cancelled by ${userName} ❌`);
            setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
        });

        return () => {
            socket.off('booking:new');
            socket.off('booking:cancelled');
        };
    }, [socket]);

    // Auto-dismiss messages
    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => { setMessage(''); setError(''); }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, error]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/bookings/company-bookings`);
            setBookings(Array.isArray(res.data) ? res.data : res.data.bookings || []);
        } catch (err) {
            console.error(err);
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleBookingStatus = async (id, status) => {
        try {
            setProcessingId(id);
            const res = await axios.put(`${API_URL}/api/bookings/${id}`, { status });

            const updatedBooking = res.data;
            setBookings(prevBookings => prevBookings.map(b => (b._id === id ? updatedBooking : b)));
            setMessage(`Booking ${status}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update booking');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredBookings = bookings.filter(b =>
        filterStatus === 'all' || b.status === filterStatus
    );

    if (loading) return <div className="text-center py-10 text-gray-400">Loading bookings...</div>;

    return (
        <div className="space-y-4">
            {/* Messages */}
            {(error || message) && (
                <div className={`p-4 rounded-xl mb-6 backdrop-blur-md text-center border ${error ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                    {error ? `⚠️ ${error}` : `✨ ${message}`}
                </div>
            )}

            <div className="flex flex-col mb-10">
                <div className="text-center mb-6">
                    <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-2 font-creepster tracking-wide drop-shadow-[0_2px_4px_rgba(255,165,0,0.3)]">Booking Requests</h2>
                    <p className="text-gray-400">Respond to mortal summons and inquiries</p>
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

            {filteredBookings.length === 0 ? (
                (
                    <div className="flex flex-col items-center justify-center py-20 bg-[#15151e]/30 rounded-2xl border border-dashed border-gray-800">
                        <div className="text-8xl mb-6">👻</div>
                        <h3 className="text-2xl font-bold text-gray-300 mb-2 font-creepster tracking-wider">No Bookings Found</h3>
                    </div>
                )
            ) : (
                filteredBookings.map((booking) => (
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
                            <h3 className="text-lg font-bold text-white mb-1">{booking.service?.name || 'Service Unavailable'}</h3>
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
                                        disabled={processingId === booking._id}
                                        className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                                    >
                                        {processingId === booking._id ? <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div> : 'Accept'}
                                    </button>
                                    <button
                                        onClick={() => handleBookingStatus(booking._id, 'rejected')}
                                        disabled={processingId === booking._id}
                                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                                    >
                                        {processingId === booking._id ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div> : 'Reject'}
                                    </button>
                                </>
                            )}
                            {booking.status === 'accepted' && (
                                <button
                                    onClick={() => handleBookingStatus(booking._id, 'completed')}
                                    disabled={processingId === booking._id}
                                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                                >
                                    {processingId === booking._id ? <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div> : 'Mark Completed'}
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default BookingList;
