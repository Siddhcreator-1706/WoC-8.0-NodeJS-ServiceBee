import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
            <nav className="px-6 py-4 border-b border-white/5 fixed top-0 w-full bg-[#0a0a0f]/80 backdrop-blur-xl z-50 transition-all duration-300 h-20">
                <div className="flex justify-between items-center  mx-auto">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="Phantom Agency Logo" className="w-10 h-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_8px_rgba(255,102,0,0.5)]" />
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 tracking-wider drop-shadow-[0_2px_4px_rgba(255,165,0,0.3)] group-hover:text-orange-400 transition-colors" style={{ fontFamily: 'Creepster, cursive' }}>
                            Phantom Agency
                        </h1>
                    </Link>

                    {/* Hamburger Button (Always Visible) */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-pumpkin hover:text-blood transition-colors p-2 rounded-lg hover:bg-pumpkin/10 z-50 relative group"
                    >
                        {/* Animated Hamburger Icon */}
                        <div className="w-6 h-6 flex flex-col justify-center items-center">
                            <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5 bg-blood' : '-translate-y-1'}`} />
                            <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
                            <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5 bg-blood' : 'translate-y-1'}`} />
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
                            className="absolute right-0 top-0 bottom-0 w-64 bg-night border-l border-white/10 shadow-[0_0_50px_rgba(192,57,43,0.2)] pt-24 px-6 overflow-y-auto"
                        >
                            <div className="flex flex-col gap-4">
                                {user ? (
                                    <>
                                        {/* Role Specific Links */}
                                        {user.role === 'user' && (
                                            <>
                                                <Link to="/user/profile" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-pumpkin font-medium transition-colors text-lg border-l-2 border-transparent hover:border-pumpkin">Profile</Link>
                                                <Link to="/user/services" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-pumpkin font-medium transition-colors text-lg border-l-2 border-transparent hover:border-pumpkin">Find Services</Link>
                                                <Link to="/user/bookings" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-pumpkin font-medium transition-colors text-lg border-l-2 border-transparent hover:border-pumpkin">Bookings</Link>
                                                <Link to="/user/complaints" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-pumpkin font-medium transition-colors text-lg border-l-2 border-transparent hover:border-pumpkin">Complaints</Link>
                                                <Link to="/user/favorites" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-pumpkin font-medium transition-colors text-lg border-l-2 border-transparent hover:border-pumpkin">Favorites</Link>
                                            </>
                                        )}

                                        {user.role === 'provider' && (
                                            <>
                                                <Link to="/provider/profile" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-pumpkin font-medium transition-colors text-lg border-l-2 border-transparent hover:border-pumpkin">My Profile</Link>
                                                <Link to="/provider/services" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-pumpkin font-medium transition-colors text-lg border-l-2 border-transparent hover:border-pumpkin">My Services</Link>
                                                <Link to="/provider/bookings" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-pumpkin font-medium transition-colors text-lg border-l-2 border-transparent hover:border-pumpkin">Bookings</Link>
                                                <Link to="/provider/complaints" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-pumpkin font-medium transition-colors text-lg border-l-2 border-transparent hover:border-pumpkin">Complaints</Link>
                                            </>
                                        )}

                                        <div className="border-t border-white/10 my-4 pt-4">
                                            <button
                                                onClick={() => { handleLogout(); setIsOpen(false); }}
                                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-blood/20 text-blood hover:text-red-400 font-medium transition-colors flex items-center gap-2 text-lg group"
                                            >
                                                <svg className="w-5 h-5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 mt-2">
                                        <Link to="/login" onClick={() => setIsOpen(false)} className="text-center bg-white/5 hover:bg-white/10 text-pumpkin py-3 rounded-lg font-bold transition-colors font-creepster tracking-wider text-xl">Login</Link>
                                        <Link to="/signup" onClick={() => setIsOpen(false)} className="text-center bg-gradient-to-r from-pumpkin to-blood hover:from-blood hover:to-pumpkin text-white py-3 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(255,102,0,0.3)]">Sign Up</Link>
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
