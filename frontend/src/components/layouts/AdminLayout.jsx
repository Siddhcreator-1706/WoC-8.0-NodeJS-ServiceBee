import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const tabs = [
        { path: 'overview', label: 'Overview', icon: '🎃' },
        { path: 'services', label: 'Services', icon: '🕯️' },
        { path: 'complaints', label: 'Complaints', icon: '👻' },
        { path: 'users', label: 'Users & Companies', icon: '🦇' },
    ];

    const currentTab = tabs.find(tab => location.pathname.includes(tab.path)) || tabs[0];

    const handleLogout = async () => {
        setIsMobileMenuOpen(false);
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen md:h-[100dvh] bg-[#0a0a0f] text-gray-100 font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col bg-[#0d0d14] border-r border-orange-900/20 relative overflow-hidden">
                {/* Sidebar Halloween Glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-500/5 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-900/10 to-transparent" />
                </div>

                <div className="p-6 flex items-center gap-3 border-b border-orange-900/20 h-20 relative z-10">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 p-[2px] shadow-lg shadow-orange-500/30">
                        <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center font-bold text-orange-400 text-sm">
                            🎃
                        </div>
                    </div>
                    <h1 className="text-xl font-bold font-creepster text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 tracking-widest">
                        PHANTOM
                    </h1>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 relative z-10 custom-scrollbar" data-lenis-prevent>
                    {tabs.map((tab) => {
                        const isActive = location.pathname.includes(tab.path);
                        return (
                            <Link
                                key={tab.path}
                                to={`/admin/${tab.path}`}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                                    ${isActive
                                        ? 'bg-gradient-to-r from-orange-500/15 to-red-500/10 text-orange-300 border border-orange-500/25 shadow-md shadow-orange-900/10'
                                        : 'text-gray-400 hover:text-orange-300 hover:bg-orange-500/5 border border-transparent'}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeSidebar"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-gradient-to-b from-orange-400 to-red-500 rounded-r-full shadow-lg shadow-orange-500/50"
                                    />
                                )}
                                <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{tab.icon}</span>
                                <span className="font-medium text-sm">{tab.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-orange-900/20 relative z-10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-transparent hover:border-red-500/20 group"
                    >
                        <span className="text-xl group-hover:-translate-x-1 transition-transform">🚪</span>
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                    <div className="mt-3 text-[10px] text-center text-gray-600 font-mono tracking-wider">
                        PHANTOM v2.4 · Admin
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="md:hidden bg-[#0d0d14]/95 backdrop-blur-md border-b border-orange-900/20 h-14 flex items-center justify-between px-4 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🎃</span>
                        <span className="font-creepster text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">PHANTOM</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-orange-400 hover:text-orange-300 p-2 rounded-lg focus:outline-none"
                    >
                        <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
                            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                        </div>
                    </button>
                </header>

                {/* Mobile Menu Drawer */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <div className="fixed inset-0 z-40 md:hidden top-14">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                            <motion.div
                                initial={{ y: '-100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '-100%' }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="absolute top-0 left-0 right-0 bg-[#0d0d14] border-b border-orange-900/30 shadow-2xl shadow-orange-900/10 overflow-hidden rounded-b-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-3 space-y-1">
                                    {tabs.map((tab) => {
                                        const isActive = location.pathname.includes(tab.path);
                                        return (
                                            <Link
                                                key={tab.path}
                                                to={`/admin/${tab.path}`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-orange-500/10 text-orange-300 border border-orange-500/20'
                                                        : 'text-gray-400 hover:text-orange-300 hover:bg-orange-500/5 border border-transparent'}`}
                                            >
                                                <span className="text-xl">{tab.icon}</span>
                                                <span className="font-medium text-sm">{tab.label}</span>
                                            </Link>
                                        );
                                    })}
                                    <div className="border-t border-orange-900/20 my-2 pt-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3"
                                        >
                                            <span className="text-xl">🚪</span>
                                            <span className="font-medium text-sm">Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Main Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 custom-scrollbar relative z-0" data-lenis-prevent>
                    <div className="max-w-7xl mx-auto w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
