import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import API_URL from '../config/api';

const ServiceDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [isBookmarked, setIsBookmarked] = useState(false);

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingNotes, setBookingNotes] = useState('');
    const [bookingAddress, setBookingAddress] = useState('');

    useEffect(() => {
        fetchService();
        if (user) checkBookmark();
    }, [id, user]);

    const fetchService = async () => {
        try {
            const res = await fetch(`${API_URL}/api/services/${id}`);
            const data = await res.json();
            setService(data);
            if (user && data.ratings) {
                const userRating = data.ratings.find(r => r.user === user._id);
                if (userRating) {
                    setRating(userRating.value);
                    setReview(userRating.review || '');
                }
            }
        } catch (error) {
            console.error('Failed to fetch service:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkBookmark = async () => {
        try {
            const res = await fetch(`${API_URL}/api/bookmarks/check/${id}`, { credentials: 'include' });
            const data = await res.json();
            setIsBookmarked(data.isBookmarked);
        } catch (error) {
            console.error('Failed to check bookmark:', error);
        }
    };

    const toggleBookmark = async () => {
        if (!user) {
            setMessage('Please login to bookmark');
            return;
        }
        try {
            if (isBookmarked) {
                await fetch(`${API_URL}/api/bookmarks/${id}`, { method: 'DELETE', credentials: 'include' });
                setIsBookmarked(false);
                setMessage('Removed from favorites');
            } else {
                await fetch(`${API_URL}/api/bookmarks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ serviceId: id })
                });
                setIsBookmarked(true);
                setMessage('Added to favorites!');
            }
        } catch (error) {
            setMessage('Error updating bookmark');
        }
    };

    const handleRate = async (value) => {
        if (!user) {
            setMessage('Please login to rate');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/services/${id}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ value, review })
            });
            if (res.ok) {
                const data = await res.json();
                setService(data);
                setRating(value);
                setMessage('Rating submitted!');
            } else {
                setMessage('Failed to submit rating');
            }
        } catch (error) {
            setMessage('Error submitting rating');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBookService = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!user) {
            setMessage('Please login to book a service');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    serviceId: id,
                    companyId: service.company._id, // Ensure service has company populated
                    date: bookingDate,
                    notes: bookingNotes,
                    address: bookingAddress || user.city
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('Booking request sent successfully!');
                setShowBookingModal(false);
                setBookingDate('');
                setBookingNotes('');
            } else {
                setMessage(data.message || 'Booking failed');
            }
        } catch (error) {
            setMessage('Error processing booking');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-orange-400 text-xl">Loading service...</div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-red-400 text-xl">Service not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative">

            {/* Booking Modal */}
            <AnimatePresence>
                {showBookingModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-gray-800 border border-purple-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <h3 className="text-2xl font-bold text-orange-400 mb-4" style={{ fontFamily: 'Creepster, cursive' }}>Book Service</h3>

                            <form onSubmit={handleBookService} className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Preferred Date</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        className="w-full p-3 bg-gray-700/50 rounded-xl text-white border border-gray-600 focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Address</label>
                                    <input
                                        type="text"
                                        placeholder={user?.city || "Enter address"}
                                        value={bookingAddress}
                                        onChange={(e) => setBookingAddress(e.target.value)}
                                        className="w-full p-3 bg-gray-700/50 rounded-xl text-white border border-gray-600 focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Notes (Optional)</label>
                                    <textarea
                                        value={bookingNotes}
                                        onChange={(e) => setBookingNotes(e.target.value)}
                                        placeholder="Any special instructions..."
                                        className="w-full p-3 bg-gray-700/50 rounded-xl text-white border border-gray-600 focus:border-purple-500 outline-none h-24 resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowBookingModal(false)}
                                        className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-900/50"
                                    >
                                        Confirm Booking
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800/50 border border-purple-500/20 rounded-2xl overflow-hidden">
                    <div className="h-56 bg-gradient-to-br from-purple-800/30 to-orange-500/20 flex items-center justify-center relative">
                        <span className="text-8xl">🎃</span>
                        <button
                            onClick={toggleBookmark}
                            className={`absolute top-4 right-4 text-3xl ${isBookmarked ? 'text-yellow-400' : 'text-gray-400'} hover:scale-110 transition-transform`}
                        >
                            {isBookmarked ? '🔖' : '📑'}
                        </button>
                    </div>

                    <div className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <div>
                                <h2 className="text-4xl font-bold text-orange-400 mb-2" style={{ fontFamily: 'Creepster, cursive' }}>{service.name}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full capitalize">{service.category}</span>
                                    {service.company && (
                                        <span className="text-sm text-gray-400">by {service.company.name}</span>
                                    )}
                                </div>
                            </div>

                            {user && user.role === 'user' && (
                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-900/30 transition-all transform hover:scale-105"
                                >
                                    Book Now
                                </button>
                            )}
                        </div>

                        <p className="text-purple-400 mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {service.location}
                        </p>

                        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 mb-8">
                            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Description</h3>
                            <p className="text-gray-300 text-lg leading-relaxed">{service.description}</p>
                        </div>

                        <div className="flex items-center gap-6 mb-8">
                            <div className="bg-green-500/10 input-bordered border border-green-500/30 px-6 py-3 rounded-xl">
                                <span className="block text-xs text-green-400 uppercase tracking-wider">Price</span>
                                <span className="text-3xl text-green-400 font-bold">${service.price}</span>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/30 px-6 py-3 rounded-xl">
                                <span className="block text-xs text-yellow-400 uppercase tracking-wider">Rating</span>
                                <span className="text-2xl text-yellow-400 font-bold">⭐ {service.averageRating || 'N/A'}</span>
                            </div>
                        </div>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl mb-6 text-center font-medium ${message.includes('success') ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                            >
                                {message}
                            </motion.div>
                        )}

                        {/* Rating Section */}
                        {canRate ? (
                            <div className="border-t border-purple-500/20 pt-8">
                                <h3 className="text-2xl text-white mb-6 font-bold">Rate this Service</h3>
                                <div className="flex gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            disabled={submitting}
                                            className={`text-3xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    placeholder="Share your experience with this service..."
                                    className="w-full p-4 bg-gray-900/50 rounded-xl text-white border border-gray-700 focus:border-purple-500 outline-none h-32 resize-none mb-4 transition-all"
                                />
                                <button
                                    onClick={() => handleRate(rating)}
                                    disabled={submitting || rating === 0}
                                    className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        ) : (
                            user && user.role === 'user' && (
                                <div className="border-t border-purple-500/20 pt-8 text-center text-gray-500 italic">
                                    <p>You can rate this service after you satisfy a completed booking.</p>
                                </div>
                            )
                        )}

                        {/* Past Reviews List */}
                        <div className="mt-12 border-t border-purple-500/20 pt-8">
                            <h3 className="text-2xl text-white mb-6 font-bold">Past Reviews ({service.ratings?.length || 0})</h3>
                            {service.ratings && service.ratings.length > 0 ? (
                                <div className="space-y-6">
                                    {service.ratings.map((rate, index) => (
                                        <div key={index} className="bg-gray-900/40 p-6 rounded-xl border border-gray-700/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                                        {rate.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white">{rate.user?.name || 'Anonymous User'}</h4>
                                                        <span className="text-xs text-gray-500">{new Date(rate.date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < rate.value ? 'opacity-100' : 'opacity-30'}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                            {rate.review && <p className="text-gray-300 mt-2 italic">"{rate.review}"</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No reviews yet. Be the first to rate!</p>
                            )}
                        </div>

                        {/* Complaint Link */}
                        {user && (
                            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                                <Link to="/complaints" className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm hover:underline">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Report an issue with this service
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ServiceDetail;
