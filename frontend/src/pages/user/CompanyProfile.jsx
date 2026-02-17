import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';


const CompanyProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await axios.get(`/api/companies/${id}`);
                setCompany(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center text-white">Loading...</div>;
    if (!company) return <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center text-white">Company not found</div>;

    return (
        <div ref={containerRef} className="min-h-screen bg-[#0f0f13] text-white py-12">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0f0f13] to-[#0f0f13]" />
            </div>

            {/* Blur/Gradient Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-900/20 via-zinc-900/50 to-zinc-950 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-orange-500 transition-colors group cursor-pointer"
                >
                    <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-orange-500/30 group-hover:bg-orange-500/10 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </div>
                    <span className="font-medium text-sm">Back to Services</span>
                </button>

                {/* Unified Company Header & Location */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-16 rounded-3xl overflow-hidden border border-zinc-800 bg-[#121216] shadow-2xl relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-transparent pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row">
                        {/* Company Details & Location Combined */}
                        <div className="flex-1 p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                            {/* Logo */}
                            <div className="relative shrink-0 group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-2xl bg-zinc-900 group-hover:scale-[1.02] transition-transform duration-500">
                                    {company.logo ? (
                                        <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-6xl">🏰</div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 w-full pt-2">
                                <div className="flex flex-col gap-2 mb-6 text-left">
                                    <h1 className="text-4xl md:text-6xl font-bold font-creepster text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-orange-200 tracking-wider drop-shadow-sm">
                                        {company.name}
                                    </h1>
                                    <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-transparent rounded-full opacity-50"></div>
                                </div>

                                <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-8 max-w-2xl font-light tracking-wide text-left">
                                    {company.description}
                                </p>

                                <div className="flex flex-wrap items-center justify-start gap-6 text-zinc-400">
                                    <div className="flex items-center gap-2 group hover:text-white transition-colors cursor-default">
                                        <span className="text-xl text-zinc-500 group-hover:text-orange-500 transition-colors">✉️</span>
                                        <span className="text-sm font-medium tracking-wide">{company.email}</span>
                                    </div>

                                    {company.phone && (
                                        <div className="flex items-center gap-2 group hover:text-white transition-colors cursor-default">
                                            <span className="text-xl text-zinc-500 group-hover:text-green-500 transition-colors">📞</span>
                                            <span className="text-sm font-medium tracking-wide">{company.phone}</span>
                                        </div>
                                    )}

                                    {company.address && (
                                        <div className="flex items-center gap-2 group hover:text-white transition-colors cursor-default">
                                            <span className="text-xl text-zinc-500 group-hover:text-purple-500 transition-colors">📍</span>
                                            <span className="text-sm font-medium tracking-wide">{company.address.city}, {company.address.state}</span>
                                        </div>
                                    )}

                                    {company.website && (
                                        <a
                                            href={company.website}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 group hover:text-white transition-colors cursor-pointer"
                                        >
                                            <span className="text-xl text-zinc-500 group-hover:text-blue-400 transition-colors">🌐</span>
                                            <span className="text-sm font-medium tracking-wide border-b border-transparent group-hover:border-zinc-500">Website</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
                    <div className="relative overflow-hidden bg-zinc-900/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl group hover:border-orange-500/30 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-opacity">
                            <div className="text-5xl text-orange-500">🕯️</div>
                        </div>
                        <div className="relative z-10">
                            <div className="text-4xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors font-creepster tracking-wider">
                                {company.services?.length || 0}
                            </div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Services</div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-zinc-900/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl group hover:border-orange-500/30 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-opacity">
                            <div className="text-5xl text-purple-500">📜</div>
                        </div>
                        <div className="relative z-10">
                            <div className="text-4xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors font-creepster tracking-wider">
                                {company.stats?.totalReviews || 0}
                            </div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Reviews</div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-zinc-900/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl group hover:border-orange-500/30 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-opacity">
                            <div className="text-5xl text-yellow-500">⭐</div>
                        </div>
                        <div className="relative z-10">
                            <div className="text-4xl font-bold text-orange-500 mb-1 flex items-baseline gap-2 font-creepster tracking-wider">
                                {company.stats?.overallRating || 0}<span className="text-sm text-gray-500 font-sans font-normal">/ 5.0</span>
                            </div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Rating</div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-zinc-900/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl group hover:border-orange-500/30 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-opacity">
                            <div className="text-5xl text-red-500">🔮</div>
                        </div>
                        <div className="relative z-10">
                            <div className="text-4xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors font-creepster tracking-wider">
                                {company.stats?.completedBookings || 0}
                            </div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Completed</div>
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <div className="mb-24">
                    <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-orange-500 font-creepster tracking-wide mb-1">
                                Services
                            </h2>
                            <p className="text-sm text-gray-400">Mystical offerings by this coven</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 services-grid">
                        {company.services?.map((service, index) => (
                            <motion.div
                                key={service._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="block group h-full"
                            >
                                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-orange-500/40 hover:shadow-[0_0_40px_rgba(255,100,0,0.1)] transition-all duration-500 h-full flex flex-col transform-gpu hover:-translate-y-2">
                                    <div className="h-48 bg-zinc-950 relative overflow-hidden">
                                        {service.image ? (
                                            <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-6xl grayscale group-hover:grayscale-0 transition-all duration-500">🔮</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#15151e] via-transparent to-transparent opacity-80" />
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-black/80 backdrop-blur-xl px-2.5 py-1 rounded-full border border-white/20 text-white text-sm font-bold shadow-xl">₹{service.price}</span>
                                        </div>
                                        <div className="absolute bottom-3 left-4">
                                            <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
                                                {service.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{service.name}</h3>
                                        <p className="text-gray-300 text-xs line-clamp-3 mb-6 flex-1 leading-relaxed">{service.description}</p>

                                        <Link to={`/user/services/${service._id}`} className="block w-full py-3 bg-white/10 hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600 text-white border border-white/10 hover:border-transparent rounded-xl transition-all font-bold text-xs uppercase tracking-wider text-center shadow-lg hover:shadow-orange-500/20">
                                            Book Ritual
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {(!company.services || company.services.length === 0) && (
                        <div className="text-center py-16 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                            <div className="text-5xl mb-4 grayscale opacity-20">🕸️</div>
                            <h3 className="text-xl font-bold text-gray-400 mb-1">No Rituals Found</h3>
                            <p className="text-sm italic text-gray-500">This coven has no active offerings at the moment.</p>
                        </div>
                    )}
                </div>


            </div>
        </div >
    );
};

export default CompanyProfile;
