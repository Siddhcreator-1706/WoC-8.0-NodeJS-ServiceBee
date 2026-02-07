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
    const [canRate, setCanRate] = useState(false);
    const [isEditingReview, setIsEditingReview] = useState(false);

    useEffect(() => {
        fetchService();
        if (user) {
            checkBookmark();
            checkBookingStatus();
        }
    }, [id, user]);

    const checkBookingStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/api/bookings/my-bookings`, { credentials: 'include' });
            if (res.ok) {
                const bookings = await res.json();
                const hasCompletedBooking = bookings.some(
                    b => (b.service._id === id || b.service === id) && b.status === 'completed'
                );
                setCanRate(hasCompletedBooking);
            }
        } catch (error) {
            console.error('Error checking booking status:', error);
        }
    };

    const fetchService = async () => {
        try {
            const res = await fetch(`${API_URL}/api/services/${id}`);
            const data = await res.json();
            setService(data);
            if (user && data.ratings) {
                const userRating = data.ratings.find(r => (r.user?._id || r.user) === user._id);
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
            const data = await res.json();
            if (res.ok) {
                // Manually populate the new rating with current user details for immediate display
                // The backend returns the service with unpopulated user IDs in ratings
                const updatedRatings = data.ratings.map(r => {
                    if (r.user === user._id || r.user?._id === user._id) {
                        return { ...r, user: user, date: new Date() }; // Inject current user and date
                    }
                    // For other ratings, preserve existing populated data if available in current state
                    const existing = service.ratings.find(old => old._id === r._id);
                    return existing || r;
                });

                setService({ ...data, ratings: updatedRatings });
                setService({ ...data, ratings: updatedRatings });
                setRating(value);
                setIsEditingReview(false);
                setMessage('Rating submitted!');
            } else {
                setMessage(data.message || 'Failed to submit rating');
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
            const formattedDate = new Date(bookingDate).toISOString();

            const res = await fetch(`${API_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    serviceId: id,
                    companyId: service.company._id,
                    date: formattedDate,
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
                setBookingAddress(''); // Reset address as requested
            } else {
                setMessage(data.message || 'Booking failed');
            }
        } catch (error) {
            console.error('Booking error:', error);
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
        <div className="min-h-screen bg-[#0f0f13] relative overflow-hidden pt-24 pb-12">
            <div className="noise-overlay" />

            {/* Background Ambience */}
            <div className="fixed top-20 left-[10%] w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="fixed bottom-20 right-[10%] w-96 h-96 bg-orange-900/10 rounded-full blur-[128px] pointer-events-none" />

            {/* Booking Modal */}
            <AnimatePresence>
                {showBookingModal && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBookingModal(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-[#15151e]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
                            style={{ boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}
                        >
                            <div className="p-8">
                                <h3 className="text-3xl font-bold text-center mb-2 font-creepster tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500">
                                    Summon Service
                                </h3>
                                <p className="text-center text-gray-400 text-sm mb-6">Complete the ritual to secure your booking</p>

                                <form onSubmit={handleBookService} className="space-y-5 relative z-10">
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Preferred Date</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            className="w-full p-3.5 bg-black/40 rounded-xl text-gray-200 border border-white/10 focus:border-purple-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Address</label>
                                        <input
                                            type="text"
                                            placeholder={user?.city || "Enter address"}
                                            value={bookingAddress}
                                            onChange={(e) => setBookingAddress(e.target.value)}
                                            className="w-full p-3.5 bg-black/40 rounded-xl text-gray-200 border border-white/10 focus:border-purple-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Notes (Optional)</label>
                                        <textarea
                                            value={bookingNotes}
                                            onChange={(e) => setBookingNotes(e.target.value)}
                                            placeholder="Any special instructions for the spirits..."
                                            className="w-full p-3.5 bg-black/40 rounded-xl text-gray-200 border border-white/10 focus:border-purple-500 outline-none h-24 resize-none transition-colors"
                                        />
                                    </div>

                                    <div className="flex gap-4 mt-8 pt-4 border-t border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setShowBookingModal(false)}
                                            className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors font-medium border border-white/5"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 transition-all border border-orange-500/20"
                                        >
                                            Confirm Ritual
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="max-w-5xl mx-auto px-6">
                {/* Back Button */}
                <Link to="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-400 mb-8 transition-colors group">
                    <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Services
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Image & Quick Stats */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="premium-card rounded-2xl overflow-hidden group"
                        >
                            <div className="h-64 sm:h-96 relative overflow-hidden">
                                {service.image ? (
                                    <img
                                        src={service.image}
                                        alt={service.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : service.company?.logo ? (
                                    <div className="w-full h-full bg-[#1a1a20] flex items-center justify-center p-12">
                                        <img
                                            src={service.company.logo}
                                            alt={service.company.name}
                                            className="max-h-full max-w-full opacity-60 filter grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-orange-900/20 flex items-center justify-center">
                                        <span className="text-8xl opacity-30 group-hover:scale-110 transition-transform duration-500">🎃</span>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f13] via-[#0f0f13]/60 to-transparent opacity-90" />

                                <div className="absolute top-4 right-4 z-20">
                                    <button
                                        onClick={toggleBookmark}
                                        className={`p-3 rounded-xl backdrop-blur-md border transition-all ${isBookmarked
                                            ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                                            : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:bg-black/60'}`}
                                    >
                                        <svg className="w-6 h-6" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="absolute bottom-0 left-0 w-full p-8 z-10">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <span className="px-3 py-1 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                                            {service.category}
                                        </span>
                                        {service.company && (
                                            <span className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                                                By {service.company.name}
                                            </span>
                                        )}
                                        {service.company?.website && (
                                            <a href={service.company.website} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md hover:bg-blue-500/30 transition-colors flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                Visit Website
                                            </a>
                                        )}
                                    </div>
                                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 font-creepster tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                        {service.name}
                                    </h1>
                                    <div className="flex items-center text-gray-300 gap-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span className="font-medium tracking-wide">{service.location}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Description & Features */}
                        <div className="grid gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="premium-card rounded-2xl p-8"
                            >
                                <h3 className="text-xl font-bold text-white mb-4 font-creepster tracking-wider">About the Service</h3>
                                <p className="text-gray-400 leading-relaxed text-lg">{service.description}</p>
                            </motion.div>

                            {/* service.tags && service.tags.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="premium-card rounded-2xl p-8"
                                >
                                    <h3 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
                                        <span className="text-purple-400">✨</span> Experience Highlights
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {service.tags.map((tag, index) => (
                                            <span key={index} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:border-purple-500/50 hover:text-purple-300 transition-colors cursor-default">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ) */}
                        </div>

                        {/* Reviews Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="premium-card rounded-2xl p-8"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold text-white font-creepster tracking-wider">
                                    Customer Reviews <span className="text-gray-500 text-lg font-sans">({service.ratings?.length || 0})</span>
                                </h3>
                                {canRate && (
                                    <span className="hidden"></span>
                                )}
                            </div>

                            {/* Rating Form */}
                            {canRate && (
                                <div className="mb-10 p-6 bg-white/5 rounded-xl border border-white/5">
                                    {service.ratings?.some(r => (r.user?._id || r.user) === user?._id) && !isEditingReview ? (
                                        // Read-Only View
                                        <div className="flex flex-col gap-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-lg font-bold text-white mb-1">Your Review</h4>
                                                    <div className="flex text-yellow-500 text-lg">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={i < rating ? 'opacity-100' : 'opacity-30'}>★</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setIsEditingReview(true)}
                                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors border border-white/10"
                                                >
                                                    Update Review
                                                </button>
                                            </div>
                                            <p className="text-gray-300 italic pl-4 border-l-2 border-purple-500/50">
                                                "{review}"
                                            </p>
                                        </div>
                                    ) : (
                                        // Edit Form
                                        <>
                                            <h4 className="text-lg font-bold text-gray-200 mb-4">
                                                {service.ratings?.some(r => (r.user?._id || r.user) === user?._id) ? 'Update Your Review' : 'Rate this Experience'}
                                            </h4>
                                            <div className="flex gap-2 mb-6">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() => setRating(star)}
                                                        disabled={submitting}
                                                        className={`text-3xl transition-all hover:scale-110 focus:outline-none ${star <= rating ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]' : 'text-gray-700 hover:text-gray-500'}`}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={review}
                                                onChange={(e) => setReview(e.target.value)}
                                                placeholder="Share your haunted experience..."
                                                className="w-full p-4 bg-black/40 rounded-xl text-gray-200 border border-white/10 focus:border-purple-500 outline-none h-32 resize-none mb-4 transition-colors"
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleRate(rating)}
                                                    disabled={submitting || rating === 0}
                                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
                                                >
                                                    {submitting ? 'Saving...' : 'Save Review'}
                                                </button>
                                                {isEditingReview && (
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingReview(false);
                                                            // Reset to saved state
                                                            const userRating = service.ratings.find(r => (r.user?._id || r.user) === user?._id);
                                                            if (userRating) {
                                                                setRating(userRating.value);
                                                                setReview(userRating.review);
                                                            }
                                                        }}
                                                        disabled={submitting}
                                                        className="px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg font-medium transition-colors border border-white/5"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Reviews List */}
                            <div className="space-y-6">
                                {service.ratings && service.ratings.length > 0 ? (
                                    service.ratings.map((rate, index) => (
                                        <div key={index} className="pb-6 border-b border-white/5 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-orange-400 font-bold shadow-inner">
                                                        {rate.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-200">{rate.user?.name || 'Anonymous'}</h4>
                                                        <span className="text-xs text-gray-500">{new Date(rate.date || rate.createdAt || Date.now()).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex text-yellow-400 text-sm gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < rate.value ? 'opacity-100' : 'opacity-20'}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                            {rate.review && <p className="text-gray-400 pl-14 italic leading-relaxed">"{rate.review}"</p>}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <span className="text-4xl block mb-2 opacity-30">🕸️</span>
                                        No reviews yet. Be the first to haunt this service!
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Pricing & Actions */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="premium-card rounded-2xl p-6 sticky top-24 space-y-6"
                        >
                            <div className="text-center pb-6 border-b border-white/5">
                                <span className="block text-gray-400 text-sm uppercase tracking-widest mb-1">Price per Service</span>
                                <div className="flex justify-center items-baseline gap-1">
                                    <span className="text-lg text-orange-500 font-bold">₹</span>
                                    <span className="text-5xl font-bold text-white tracking-tight">{service.price}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-2 px-4 bg-white/5 rounded-lg">
                                <span className="text-gray-400">Rating</span>
                                <span className="text-yellow-400 font-bold flex items-center gap-1">
                                    {service.averageRating ? service.averageRating.toFixed(1) : 'N/A'} <span className="text-sm">★</span>
                                </span>
                            </div>

                            {user && user.role === 'user' ? (
                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-orange-500/20"
                                >
                                    Book Now
                                </button>
                            ) : (
                                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-gray-400 text-sm">
                                        {!user ? (
                                            <>
                                                <Link to="/login" className="text-orange-400 hover:underline">Login</Link> to book this service.
                                            </>
                                        ) : (
                                            "Providers cannot book services."
                                        )}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetail;
