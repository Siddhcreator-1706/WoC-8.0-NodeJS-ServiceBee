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
        <nav className="px-6 py-4 border-b border-purple-500/20 sticky top-0 bg-gray-900/90 backdrop-blur-md z-50">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <Link to="/" className="flex items-center gap-3 group">
                    <img src="/logo.png" alt="Phantom Agency Logo" className="w-10 h-10 group-hover:rotate-12 transition-transform duration-300" />
                    <h1 className="text-2xl font-bold text-orange-400 tracking-wider" style={{ fontFamily: 'Creepster, cursive' }}>
                        Phantom Agency
                    </h1>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex gap-6 items-center">
                    {/* Common Links - Hide Services for Providers */}
                    {user?.role !== 'provider' && (
                        <Link to="/services" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">Services</Link>
                    )}

                    {user ? (
                        <>
                            {/* Role-Specific Links */}
                            {user.role === 'user' && (
                                <>
                                    <Link to="/profile" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">Profile</Link>
                                    <Link to="/favorites" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">Favorites</Link>
                                </>
                            )}

                            {user.role === 'provider' && (
                                <>
                                    <Link to="/provider?tab=overview" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">Profile</Link>
                                    <Link to="/provider?tab=services" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">My Services</Link>
                                    <Link to="/provider?tab=bookings" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">Bookings</Link>
                                </>
                            )}

                            {user.role === 'admin' && (
                                <Link to="/admin" className="text-purple-400 hover:text-purple-300 font-medium tracking-wide transition-colors">Admin Panel</Link>
                            )}

                            <div className="flex items-center gap-6 ml-4 border-l border-gray-700 pl-6">
                                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 font-medium tracking-wide transition-colors">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium tracking-wide transition-colors">Login</Link>
                            <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium tracking-wide transition-colors">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-orange-400 hover:text-orange-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden mt-4 overflow-hidden"
                    >
                        <div className="flex flex-col gap-4 pb-4">
                            <Link to="/services" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-orange-400">Services</Link>
                            {user ? (
                                <>
                                    {user.role === 'user' && (
                                        <>
                                            <Link to="/profile" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-orange-400">Profile</Link>
                                            <Link to="/favorites" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-orange-400">Favorites</Link>
                                        </>
                                    )}
                                    {user.role === 'provider' && (
                                        <>
                                            <Link to="/provider?tab=overview" onClick={() => setIsOpen(false)} className="text-orange-400">Profile</Link>
                                            <Link to="/provider?tab=services" onClick={() => setIsOpen(false)} className="text-orange-400">My Services</Link>
                                            <Link to="/provider?tab=bookings" onClick={() => setIsOpen(false)} className="text-orange-400">Bookings</Link>
                                        </>
                                    )}
                                    {user.role === 'admin' && (
                                        <Link to="/admin" onClick={() => setIsOpen(false)} className="text-purple-400">Admin Panel</Link>
                                    )}
                                    <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-left text-red-400 hover:text-red-300">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-orange-400">Login</Link>
                                    <Link to="/signup" onClick={() => setIsOpen(false)} className="text-purple-400">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
