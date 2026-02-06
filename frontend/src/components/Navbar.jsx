import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout, logoutAll } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <>
            <nav className="px-6 py-4 border-b border-white/5 fixed top-0 w-full bg-[#0a0a0f]/80 backdrop-blur-xl z-50 transition-all duration-300">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="Phantom Agency Logo" className="w-10 h-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_8px_rgba(255,102,0,0.5)]" />
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 tracking-wider drop-shadow-[0_2px_4px_rgba(255,165,0,0.3)] group-hover:text-orange-400 transition-colors" style={{ fontFamily: 'Creepster, cursive' }}>
                            Phantom Agency
                        </h1>
                    </Link>

                    {/* Hamburger Button (Always Visible) */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-orange-400 hover:text-orange-300 transition-colors p-2 rounded-lg hover:bg-orange-500/10 z-50 relative"
                    >
                        {/* Animated Hamburger Icon */}
                        <div className="w-6 h-6 flex flex-col justify-center items-center">
                            <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1'}`} />
                            <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
                            <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'}`} />
                        </div>
                    </button>
                </div>
            </nav>

            {/* Mobile/Overlay Navigation Menu */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-40">
                        {/* Backdrop - Low opacity black to dim content */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Slide-out Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-0 bottom-0 w-64 bg-[#0f0f13] border-l border-gray-800 shadow-2xl pt-24 px-6 overflow-y-auto"
                        >
                            <div className="flex flex-col gap-4">
                                {user ? (
                                    <>
                                        {/* Role Specific Links */}
                                        {user.role === 'user' && (
                                            <>
                                                <Link to="/services" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-gray-800 text-orange-400 hover:text-orange-300 font-medium transition-colors text-lg border-l-2 border-transparent hover:border-orange-500">Find Services</Link>
                                                <Link to="/profile?tab=profile" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-gray-800 text-orange-400 hover:text-orange-300 font-medium transition-colors text-lg border-l-2 border-transparent hover:border-orange-500">My Profile</Link>
                                                <Link to="/bookings" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-gray-800 text-orange-400 hover:text-orange-300 font-medium transition-colors text-lg border-l-2 border-transparent hover:border-orange-500">My Bookings</Link>
                                                <Link to="/complaints" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-gray-800 text-orange-400 hover:text-orange-300 font-medium transition-colors text-lg border-l-2 border-transparent hover:border-orange-500">My Complaints</Link>
                                                <Link to="/favorites" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-gray-800 text-orange-400 hover:text-orange-300 font-medium transition-colors text-lg border-l-2 border-transparent hover:border-orange-500">Favorites</Link>
                                            </>
                                        )}

                                        {user.role === 'provider' && (
                                            <>
                                                <Link to="/provider?tab=profile" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-gray-800 text-orange-400 hover:text-orange-300 font-medium transition-colors text-lg border-l-2 border-transparent hover:border-orange-500">Profile Page</Link>
                                                <Link to="/provider?tab=services" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-gray-800 text-orange-400 hover:text-orange-300 font-medium transition-colors text-lg border-l-2 border-transparent hover:border-orange-500">My Services</Link>
                                                <Link to="/provider?tab=bookings" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-gray-800 text-orange-400 hover:text-orange-300 font-medium transition-colors text-lg border-l-2 border-transparent hover:border-orange-500">Bookings</Link>
                                                <Link to="/provider?tab=complaints" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-gray-800 text-orange-400 hover:text-orange-300 font-medium transition-colors text-lg border-l-2 border-transparent hover:border-orange-500">Complaints</Link>
                                            </>
                                        )}

                                        {user.role === 'admin' && (
                                            <Link to="/admin" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-gray-800 text-purple-400 font-medium hover:text-purple-300 transition-colors text-lg">Admin Panel</Link>
                                        )}

                                        <div className="border-t border-gray-800 my-4 pt-4">
                                            <button
                                                onClick={() => { handleLogout(); setIsOpen(false); }}
                                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-2 text-lg"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 mt-2">
                                        <Link to="/login" onClick={() => setIsOpen(false)} className="text-center bg-gray-800 hover:bg-gray-700 text-orange-400 py-3 rounded-lg font-bold transition-colors">Login</Link>
                                        <Link to="/signup" onClick={() => setIsOpen(false)} className="text-center bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold transition-colors">Sign Up</Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
