import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PageTransition from '../../components/common/PageTransition';
import ServiceFilters from '../../components/user/ServiceFilters';

gsap.registerPlugin(ScrollTrigger);

const Services = () => {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                // Fetch all services without pagination for now to simplify filtering/animation demo
                // In production with pagination, this needs adjustment
                const res = await axios.get('/api/services?limit=100', { withCredentials: true });
                const { data } = res;

                // Handle both paginated and non-paginated responses
                const serviceList = data.services || data;
                const list = Array.isArray(serviceList) ? serviceList : [];
                setServices(list);

                // Initial filter from URL params
                const categoryParam = searchParams.get('category');
                if (categoryParam) {
                    setFilteredServices(list.filter(s => s.category === categoryParam));
                } else {
                    setFilteredServices(list);
                }
            } catch (err) {
                console.error("Failed to fetch services", err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [searchParams]); // Re-run if URL params change (e.g. clicking footer link while on page)

    const handleFilterChange = (filters) => {
        let result = services;
        // Apply URL category param if present and not overridden by manual filter
        // However, manual filter usually overrides. 
        // Logic: manual filter object has 'category'? Assuming ServiceFilters passes it.
        // If not, we check URL.

        // Simpler: Just rely on passed filters.
        if (filters.search) {
            result = result.filter(s => s.name.toLowerCase().includes(filters.search.toLowerCase()));
        }

        // State & City Filter
        if (filters.state) {
            result = result.filter(s => s.state && s.state.toLowerCase() === filters.state.toLowerCase());
        }
        if (filters.city) {
            result = result.filter(s => s.city && s.city.toLowerCase() === filters.city.toLowerCase());
        }
        // If category is in filters (from ServiceFilters component), use it.
        // But ServiceFilters doesn't have category input yet? 
        // We added footer links for categories. ServiceFilters might need update if we want UI.
        // For now, consistent logic:
        if (filters.category) {
            result = result.filter(s => s.category === filters.category);
        } else {
            const categoryParam = searchParams.get('category');
            if (categoryParam) {
                result = result.filter(s => s.category === categoryParam);
            }
        }

        if (filters.priceRange) {
            const [min, max] = filters.priceRange.split('-').map(Number);
            if (max) result = result.filter(s => s.price >= min && s.price <= max);
            else result = result.filter(s => s.price >= min);
        }
        setFilteredServices(result);

        // Re-run animation on filter change
        if (containerRef.current) {
            gsap.fromTo('.service-card',
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }
            );
        }
    };

    useGSAP(() => {
        if (loading || filteredServices.length === 0) return;

        const cards = gsap.utils.toArray('.service-card');

        gsap.fromTo(cards,
            { y: 100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.services-grid',
                    start: 'top 80%',
                }
            }
        );

    }, { scope: containerRef, dependencies: [loading, filteredServices.length] }); // Re-run when list size changes

    if (loading) return (
        <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center text-white relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 to-[#0f0f13]"></div>
            <div className="z-10 flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="font-creepster tracking-widest text-2xl animate-pulse text-orange-500">Summoning Rituals...</span>
            </div>
        </div>
    );

    return (
        <PageTransition>
            <div ref={containerRef} className="min-h-screen bg-[#0f0f13] text-gray-100 font-sans relative overflow-hidden">
                {/* Background Ambience */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
                    <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-orange-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                </div>

                <div className=" mx-auto px-6 relative z-10 py-12">
                    <div className="text-center mb-16 hero-section">
                        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-2 font-creepster tracking-wide drop-shadow-[0_2px_4px_rgba(255,165,0,0.3)]">
                            Mystic Bazaar
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Discover comprehensive supernatural services for your haunting needs.
                        </p>
                    </div>

                    <ServiceFilters onFilter={handleFilterChange} initialFilters={{}} />

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 services-grid perspective-1000 mt-8">
                        {filteredServices.map(service => (
                            <Link to={`/user/services/${service._id}`} key={service._id} className="service-card block group h-full">
                                <div className="bg-[#15151e]/80 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(255,69,0,0.15)] transition-all duration-500 h-full flex flex-col transform-gpu hover:-translate-y-2">
                                    <div className="h-56 bg-zinc-950 relative overflow-hidden">
                                        {service.image ? (
                                            <img src={service.image} alt={service.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-6xl opacity-30 grayscale group-hover:grayscale-0 transition-all duration-500">🔮</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#15151e] via-transparent to-transparent" />
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                            <span className="bg-orange-600/90 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-sm shadow-lg">
                                                {service.category}
                                            </span>
                                            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                                                <span className="text-yellow-500">★</span>
                                                <span className="text-white font-bold">{service.averageRating?.toFixed(1) || 'New'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{service.name}</h2>

                                        {service.company && (
                                            <Link
                                                to={`/user/company/${service.company._id}`}
                                                className="flex items-center gap-2 text-sm text-pumpkin hover:text-orange-400 mb-2 w-fit hover:underline group/company"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {service.company.logo ? (
                                                    <img src={service.company.logo} alt="Logo" className="w-5 h-5 rounded-full object-cover border border-white/10" />
                                                ) : (
                                                    <span className="text-lg">🏢</span>
                                                )}
                                                <span>By {service.company.companyName || service.company.name || 'Unknown Provider'}</span>
                                            </Link>
                                        )}

                                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                                            <span>📍</span>
                                            {service.city}, {service.state}
                                        </div>
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">{service.description}</p>

                                        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                                            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                                                ₹{service.price}
                                            </span>
                                            <span className="text-sm text-gray-500 group-hover:text-white transition-colors flex items-center gap-1 font-bold uppercase tracking-wider">
                                                View <span className="group-hover:translate-x-1 transition-transform">→</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {filteredServices.length === 0 && (
                        <div className="text-center py-20 animate-pulse">
                            <div className="text-6xl mb-4 grayscale opacity-50">👻</div>
                            <h3 className="text-2xl font-bold text-gray-500">No rituals found in this realm.</h3>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default Services;
