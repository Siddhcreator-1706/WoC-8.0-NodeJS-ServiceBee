import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import API_URL from '../config/api';

gsap.registerPlugin(ScrollTrigger);

const CompanyProfile = () => {
    const { id } = useParams();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await fetch(`${API_URL}/api/companies/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setCompany(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [id]);

    useGSAP(() => {
        if (!company) return;

        // Hero Animation
        gsap.from('.hero-element', {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out'
        });

        // Services Animation
        gsap.from('.service-card', {
            scrollTrigger: {
                trigger: '.services-grid',
                start: 'top 80%',
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out'
        });

    }, { scope: containerRef, dependencies: [company] });

    if (loading) return <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center text-white">Loading...</div>;
    if (!company) return <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center text-white">Company not found</div>;

    return (
        <div ref={containerRef} className="min-h-screen bg-[#0f0f13] text-white py-12">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0f0f13] to-[#0f0f13]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
                    <div className="w-40 h-40 md:w-56 md:h-56 shrink-0 rounded-full overflow-hidden border-4 border-orange-500/20 shadow-[0_0_30px_rgba(255,165,0,0.2)] hero-element">
                        {company.logo ? (
                            <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-4xl">🏰</div>
                        )}
                    </div>

                    <div className="text-center md:text-left">
                        <h1 className="text-5xl md:text-7xl font-bold font-creepster text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-6 hero-element drop-shadow-sm">
                            {company.name}
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl hero-element leading-relaxed">
                            {company.description}
                        </p>

                        <div className="flex flex-wrap gap-6 mt-8 justify-center md:justify-start hero-element">
                            <div className="flex items-center gap-2 text-gray-400">
                                <span>✉️</span> {company.email}
                            </div>
                            {company.phone && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <span>📞</span> {company.phone}
                                </div>
                            )}
                            {company.website && (
                                <div className="flex items-center gap-2">
                                    <span>🌐</span>
                                    <a href={company.website} target="_blank" rel="noreferrer" className="text-orange-400 hover:underline">
                                        Website
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-8 text-orange-500 font-creepster tracking-wide border-b border-white/10 pb-4 inline-block">
                        Spectral Offerings
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 services-grid">
                        {company.services?.map((service) => (
                            <div key={service._id} className="service-card bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden hover:border-orange-500/50 transition-colors group">
                                <div className="h-48 bg-zinc-950 relative overflow-hidden">
                                    {service.image && (
                                        <img src={service.image} alt={service.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                        <span className="bg-orange-600/90 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                                            {service.category}
                                        </span>
                                        <span className="text-xl font-bold text-white drop-shadow-md">₹{service.price}</span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{service.name}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-3 mb-6">{service.description}</p>

                                    <button className="w-full py-3 bg-white/5 hover:bg-orange-600 hover:text-white border border-white/10 hover:border-orange-500 rounded-lg transition-all font-bold text-sm uppercase tracking-wider">
                                        Book Ritual
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {(!company.services || company.services.length === 0) && (
                        <div className="text-center py-12 text-gray-500 italic">
                            This coven has no active rituals at the moment.
                        </div>
                    )}
                </div>

                {/* Location / Additional Info */}
                {company.address && (
                    <div className="bg-zinc-900/30 rounded-2xl p-8 border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-4">Lair Location</h3>
                        <p className="text-gray-400">
                            {company.address.street}, {company.address.city}, {company.address.state} {company.address.zipCode}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyProfile;
