import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
            await fetch(`${API_URL}/api/bookmarks/${serviceId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            setBookmarks(prev => prev.filter(b => b.service._id !== serviceId));
        } catch (error) {
            console.error('Failed to remove bookmark:', error);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <nav className="px-6 py-4 flex justify-between items-center border-b border-purple-500/20">
                <Link to="/"><h1 className="text-2xl font-bold text-orange-400" style={{ fontFamily: 'Creepster, cursive' }}>🎃 ServiceBee</h1></Link>
                <Link to="/profile" className="text-gray-300 hover:text-orange-400">← Profile</Link>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <h2 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: 'Creepster, cursive' }}>
                    My <span className="text-orange-400">Favorites</span> 🔖
                </h2>

                {loading ? (
                    <div className="text-center text-orange-400">Loading...</div>
                ) : bookmarks.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                        <p className="text-xl mb-4">No favorites yet!</p>
                        <Link to="/services" className="text-orange-400 hover:text-orange-300">Browse services →</Link>
                    </div>
                ) : (
                    <div ref={cardsRef} className="space-y-4">
                        {bookmarks.map((bookmark) => (
                            <div key={bookmark._id} className="fav-card bg-gray-800/50 p-6 rounded-xl border border-purple-500/20 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-800/30 to-orange-500/20 rounded-lg flex items-center justify-center text-3xl">
                                        🎃
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-orange-400">{bookmark.service.name}</h3>
                                        <p className="text-sm text-gray-400">📍 {bookmark.service.location}</p>
                                        <div className="flex gap-4 text-sm mt-1">
                                            <span className="text-green-400">${bookmark.service.price}</span>
                                            <span className="text-yellow-400">⭐ {bookmark.service.averageRating || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/services/${bookmark.service._id}`}
                                        className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30"
                                    >
                                        View
                                    </Link>
                                    <button
                                        onClick={() => removeBookmark(bookmark.service._id)}
                                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
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
