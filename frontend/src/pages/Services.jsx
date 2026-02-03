import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import ServiceFilters from '../components/ServiceFilters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [filters, setFilters] = useState({});
    const cardsRef = useRef(null);

    const fetchServices = async (filterParams = {}, pageNum = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: pageNum, ...filterParams });
            // Remove empty params
            for (let [key, value] of params.entries()) {
                if (!value) params.delete(key);
            }

            const res = await fetch(`${API_URL}/api/services?${params}`);
            const data = await res.json();
            setServices(data.services || []);
            setPages(data.pages || 1);
            setPage(data.page || 1);
        } catch (error) {
            console.error('Failed to fetch services:', error);
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices(filters, 1);
    }, []);

    useEffect(() => {
        if (!loading && cardsRef.current) {
            gsap.fromTo(cardsRef.current.querySelectorAll('.service-card'),
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
            );
        }
    }, [loading, services]);

    const handleFilter = (newFilters) => {
        setFilters(newFilters);
        fetchServices(newFilters, 1);
    };

    const handlePageChange = (newPage) => {
        fetchServices(filters, newPage);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            {/* Navbar */}
            <nav className="px-6 py-4 flex justify-between items-center border-b border-purple-500/20 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-50">
                <Link to="/">
                    <h1 className="text-2xl font-bold text-orange-400" style={{ fontFamily: 'Creepster, cursive' }}>
                        🎃 ServiceBee
                    </h1>
                </Link>
                <Link to="/" className="text-gray-300 hover:text-orange-400">← Home</Link>
            </nav>

            <div className="px-6 py-8 max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-center text-white mb-8" style={{ fontFamily: 'Creepster, cursive' }}>
                    Our <span className="text-orange-400">Spooky</span> Services
                </h2>

                {/* Filters */}
                <ServiceFilters onFilter={handleFilter} initialFilters={filters} />

                {/* Services Grid */}
                {loading ? (
                    <div className="text-center text-orange-400 text-xl py-12">Loading services...</div>
                ) : services.length === 0 ? (
                    <div className="text-center text-gray-400 text-lg py-12">
                        No services found. Try adjusting your filters! 👻
                    </div>
                ) : (
                    <>
                        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                                <div key={service._id} className="service-card bg-gray-800/50 border border-purple-500/20 rounded-xl overflow-hidden hover:border-orange-400/50 transition-all hover:shadow-lg hover:shadow-orange-500/10">
                                    <div className="h-40 bg-gradient-to-br from-purple-800/30 to-orange-500/20 flex items-center justify-center">
                                        <span className="text-6xl">🎃</span>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-orange-400">{service.name}</h3>
                                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded capitalize">{service.category}</span>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-2">📍 {service.location}</p>
                                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{service.description}</p>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-green-400 font-bold text-lg">${service.price}</span>
                                            <span className="text-yellow-400">⭐ {service.averageRating || '0'} ({service.totalReviews || 0})</span>
                                        </div>
                                        <Link to={`/services/${service._id}`} className="block text-center py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {[...Array(pages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`px-4 py-2 rounded-lg ${page === i + 1 ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Services;
