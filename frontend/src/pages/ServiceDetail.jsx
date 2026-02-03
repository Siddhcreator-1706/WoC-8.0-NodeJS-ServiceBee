import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <nav className="px-6 py-4 flex justify-between items-center border-b border-purple-500/20">
                <Link to="/"><h1 className="text-2xl font-bold text-orange-400" style={{ fontFamily: 'Creepster, cursive' }}>🎃 ServiceBee</h1></Link>
                <Link to="/services" className="text-gray-300 hover:text-orange-400">← Back to Services</Link>
            </nav>

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
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-3xl font-bold text-orange-400" style={{ fontFamily: 'Creepster, cursive' }}>{service.name}</h2>
                            <span className="text-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full capitalize">{service.category}</span>
                        </div>

                        <p className="text-purple-400 mb-2">📍 {service.location}</p>
                        <p className="text-gray-300 text-lg mb-6">{service.description}</p>

                        <div className="flex items-center gap-6 mb-8">
                            <span className="text-2xl text-green-400 font-bold">${service.price}</span>
                            <span className="text-xl text-yellow-400">⭐ {service.averageRating || 'No ratings yet'}</span>
                            <span className="text-gray-400">({service.ratings?.length || 0} reviews)</span>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg mb-4 ${message.includes('failed') || message.includes('Error') || message.includes('login') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {message}
                            </div>
                        )}

                        {/* Rating Section */}
                        <div className="border-t border-purple-500/20 pt-6">
                            <h3 className="text-xl text-white mb-4">Rate this Service</h3>
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
                                placeholder="Write a review (optional)..."
                                className="w-full p-3 bg-gray-700 rounded-lg text-white mb-4 h-24"
                            />
                            <button
                                onClick={() => handleRate(rating)}
                                disabled={submitting || rating === 0}
                                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>

                        {/* Complaint Link */}
                        {user && (
                            <div className="mt-6 pt-6 border-t border-purple-500/20">
                                <Link to="/complaints" className="text-red-400 hover:text-red-300">
                                    📢 Have an issue? Submit a complaint
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
