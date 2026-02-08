import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api';
import axios from 'axios';

const BookingList = () => {
    const [bookings, setBookings] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

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
            setBookings(res.data);
        } catch (err) {
            console.error(err);
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleBookingStatus = async (id, status) => {
        try {
            const res = await axios.put(`${API_URL}/api/bookings/${id}`, { status });

            const updatedBooking = res.data;
            setBookings(prevBookings => prevBookings.map(b => (b._id === id ? updatedBooking : b)));
            setMessage(`Booking ${status}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update booking');
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
                    <div className="relative group">
                        <select
                            className="appearance-none bg-[#15151e] text-gray-300 text-sm py-2 px-4 pr-10 rounded-lg border border-gray-700 outline-none focus:border-orange-500 cursor-pointer shadow-lg"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
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

            {filteredBookings.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-[#15151e]/50 rounded-xl border border-dashed border-gray-800">No bookings found</div>
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
    );
};

export default BookingList;
