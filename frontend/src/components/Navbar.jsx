import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
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
                    <img src="/logo.png" alt="ServiceBee Logo" className="w-10 h-10 group-hover:rotate-12 transition-transform duration-300" />
                    <h1 className="text-2xl font-bold text-orange-400 tracking-wider" style={{ fontFamily: 'Creepster, cursive' }}>
                        Phantom Agency
                    </h1>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex gap-6 items-center">
                    <Link to="/services" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">Services</Link>
                    {user ? (
                        <>
                            <Link to="/profile" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">Profile</Link>
                            <Link to="/favorites" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">Favorites</Link>
                            {(user.role === 'admin' || user.role === 'superuser') && (
                                <Link to="/admin" className="text-purple-400 hover:text-purple-300 font-medium">Admin</Link>
                            )}
                            <button onClick={handleLogout} className="px-5 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/20">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/" className="text-orange-400 hover:text-orange-300 font-medium">Login</Link>
                            <Link to="/" className="px-5 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all border border-purple-500/20">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
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
                                    <Link to="/profile" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-orange-400">Profile</Link>
                                    <Link to="/favorites" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-orange-400">Favorites</Link>
                                    {(user.role === 'admin' || user.role === 'superuser') && (
                                        <Link to="/admin" onClick={() => setIsOpen(false)} className="text-purple-400 hover:text-purple-300">Admin</Link>
                                    )}
                                    <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-left text-red-400 hover:text-red-300">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/" onClick={() => setIsOpen(false)} className="text-orange-400">Login</Link>
                                    <Link to="/" onClick={() => setIsOpen(false)} className="text-purple-400">Sign Up</Link>
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
