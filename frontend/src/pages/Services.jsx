import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import gsap from 'gsap';
import ServiceFilters from '../components/ServiceFilters';

import API_URL from '../config/api';

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
        <div className="min-h-screen bg-[#0f0f13] text-gray-100 font-sans relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0f0f13] to-[#0f0f13]" />
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-orange-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="pt-24 px-6 py-8 max-w-7xl mx-auto relative z-10">
                <h2 className="text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-8 font-creepster tracking-wide drop-shadow-[0_2px_4px_rgba(255,165,0,0.3)]">
                    Our Spooky Services
                </h2>

                {/* Filters */}
                <ServiceFilters onFilter={handleFilter} initialFilters={filters} />

                {/* Services Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(255,165,0,0.5)]"></div>
                        <p className="text-gray-400 animate-pulse font-creepster tracking-wider">Summoning rituals...</p>
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center text-gray-400 text-lg py-12 bg-[#15151e]/30 rounded-2xl border border-dashed border-gray-800">
                        <div className="text-6xl mb-4 grayscale opacity-50">🕸️</div>
                        No services found. Try adjusting your seance parameters! 👻
                    </div>
                ) : (
                    <>
                        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000">
                            {services.map((service) => (
                                <TiltCard key={service._id} service={service} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {[...Array(pages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`px-4 py-2 rounded-lg transition-all font-bold ${page === i + 1
                                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                                            : 'bg-[#15151e] text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'}`}
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

// 3D Tilt Card Component
const TiltCard = ({ service }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="service-card premium-card bg-[#15151e]/80 backdrop-blur-md rounded-2xl overflow-hidden relative group border border-gray-800 hover:border-orange-500/50 transition-colors shadow-xl"
        >
            {/* Spooky Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

            <div className="h-44 bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden group-hover:shadow-[inset_0_0_20px_rgba(255,165,0,0.1)] transition-all">
                {service.image ? (
                    <img src={service.image} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : service.company?.logo ? (
                    <>
                        <img src={service.company.logo} alt={service.company.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity blur-sm scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#15151e] to-transparent" />
                        <div className="relative z-10 p-6 bg-black/30 rounded-full backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-500">
                            <span className="text-5xl drop-shadow-[0_0_15px_rgba(255,165,0,0.6)]">🎃</span>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-orange-900/20 flex items-center justify-center">
                        <div className="relative z-10 p-6 bg-black/30 rounded-full backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-500">
                            <span className="text-5xl drop-shadow-[0_0_15px_rgba(255,165,0,0.6)]">🎃</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 relative z-10 h-full">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        {service.company?.logo ? (
                            <img src={service.company.logo} alt={service.company.name} className="w-10 h-10 rounded-full border border-gray-700 object-cover shadow-lg" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg border border-gray-700">🏢</div>
                        )}
                        <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors leading-tight">{service.name}</h3>
                            <span className="text-xs text-gray-500 font-medium tracking-wide">{service.company?.name || "Independent"}</span>
                        </div>
                    </div>
                    <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(168,85,247,0.1)]">{service.category}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4 bg-[#0a0a0f]/50 p-2 rounded-lg border border-gray-800/50">
                    <svg className="w-4 h-4 text-orange-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {service.location}
                </div>

                <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed opacity-80">{service.description}</p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800/50">
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Price</span>
                        <span className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">₹{service.price}</span>
                    </div>
                    <Link to={`/services/${service._id}`} className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-lg shadow-lg shadow-orange-900/30 hover:shadow-orange-500/50 hover:from-orange-500 hover:to-red-500 transform hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2">
                        <span>View Ritual</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default Services;
