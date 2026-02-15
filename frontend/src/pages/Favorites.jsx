import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import gsap from 'gsap';

import API_URL from '../config/api';

const Favorites = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const cardsRef = useRef(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookmarks();
    }, [user, navigate]);

    useEffect(() => {
        if (!loading && cardsRef.current) {
            gsap.fromTo(cardsRef.current.querySelectorAll('.fav-card'),
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.1 }
            );
        }
    }, [loading, bookmarks]);

    const fetchBookmarks = async () => {
        try {
            const res = await fetch(`${API_URL}/api/bookmarks`, { credentials: 'include' });
            const data = await res.json();
            setBookmarks(data);
        } catch (error) {
            console.error('Failed to fetch bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeBookmark = async (serviceId) => {
        try {
            await axios.delete(`/api/bookmarks/${serviceId}`);
            setBookmarks(prev => prev.filter(b => b.service._id !== serviceId));
        } catch (error) {
            console.error('Failed to remove bookmark:', error);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0f0f13] relative overflow-hidden font-sans text-gray-100">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0f0f13] to-[#0f0f13]" />
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-orange-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <h2 className="text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-8 font-creepster tracking-wide drop-shadow-[0_2px_4px_rgba(255,165,0,0.3)]">
                    My Favorites 🔖
                </h2>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(255,165,0,0.5)]"></div>
                        <p className="text-gray-400 animate-pulse font-creepster tracking-wider">Summoning favorites...</p>
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-[#15151e]/30 rounded-2xl border border-dashed border-gray-800">
                        <div className="text-8xl mb-6 animate-pulse drop-shadow-[0_0_15px_rgba(150,0,255,0.5)]">⚰️</div>
                        <p className="text-2xl mb-4 text-gray-400 font-creepster tracking-wider">No favorite specters yet?</p>
                        <Link to="/services" className="text-orange-400 hover:text-orange-300 underline decoration-orange-500/30 underline-offset-4 hover:decoration-orange-500 transition-all">Browse the catalogue →</Link>
                    </div>
                ) : (
                    <div ref={cardsRef} className="space-y-4">
                        {bookmarks.map((bookmark) => (
                            <div key={bookmark._id} className="fav-card bg-[#15151e]/80 backdrop-blur-md p-6 rounded-xl border border-gray-800 flex justify-between items-center hover:border-orange-500/50 transition-all shadow-lg hover:shadow-orange-900/20 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-800/30 to-orange-500/20 rounded-lg flex items-center justify-center text-3xl border border-white/10 group-hover:scale-105 transition-transform">
                                        🎃
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">{bookmark.service.name}</h3>
                                        <p className="text-sm text-gray-400">📍 {bookmark.service.location}</p>
                                        <div className="flex gap-4 text-sm mt-1">
                                            <span className="text-green-400 font-bold">₹{bookmark.service.price}</span>
                                            <span className="text-yellow-400 flex items-center gap-1">⭐ {bookmark.service.averageRating ? bookmark.service.averageRating.toFixed(1) : 'New'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/services/${bookmark.service._id}`}
                                        className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 border border-purple-500/20 transition-all"
                                    >
                                        View
                                    </Link>
                                    <button
                                        onClick={() => removeBookmark(bookmark.service._id)}
                                        className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 border border-red-500/20 transition-all"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
