import React from 'react';
import { motion } from 'framer-motion';

const LoginForm = ({ loginData, handleLoginChange, handleLogin, loading, setIsFlipped, setError }) => {
    return (
        <div
            className={`w-full bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 backdrop-blur-2xl p-8 rounded-3xl border border-white/5 shadow-[0_0_80px_rgba(168,85,247,0.15)]`}
            style={{ backfaceVisibility: 'hidden' }}
        >
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-8">
                <motion.div
                    className="relative"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-violet-500/20 to-orange-500/20 rounded-full blur-2xl"></div>
                    <img
                        src="/logo.png"
                        alt="Phantom Agency"
                        className="w-20 h-20 relative z-10 drop-shadow-[0_0_30px_rgba(251,146,60,0.4)]"
                    />
                </motion.div>
                <h1
                    className="text-4xl md:text-5xl font-bold mt-6 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent pb-1"
                    style={{ fontFamily: 'Creepster, cursive', lineHeight: '1.2' }}
                >
                    Phantom Agency
                </h1>
                <p className="text-zinc-500 mt-2 text-xs tracking-[0.3em] uppercase">Premium Services Portal</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Field */}
                <div className="relative group">
                    <label className="text-xs text-zinc-400 mb-2 block font-medium tracking-wide">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-violet-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <input
                            type="email" name="email" value={loginData.email} onChange={handleLoginChange} required
                            className="relative w-full p-4 pl-12 bg-zinc-800/60 rounded-xl text-white border border-zinc-700/50 focus:border-orange-500/50 focus:bg-zinc-800/80 transition-all outline-none placeholder-zinc-600"
                            placeholder="spirit@phantom.realm"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                        </span>
                    </div>
                </div>

                {/* Password Field */}
                <div className="relative group">
                    <label className="text-xs text-zinc-400 mb-2 block font-medium tracking-wide">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-violet-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <input
                            type="password" name="password" value={loginData.password} onChange={handleLoginChange} required
                            className="relative w-full p-4 pl-12 bg-zinc-800/60 rounded-xl text-white border border-zinc-700/50 focus:border-orange-500/50 focus:bg-zinc-800/80 transition-all outline-none placeholder-zinc-600"
                            placeholder="••••••••"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </span>
                    </div>
                </div>

                <motion.button
                    type="submit" disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 text-white font-bold rounded-xl relative overflow-hidden group disabled:opacity-50 shadow-[0_4px_30px_rgba(251,146,60,0.35)] mt-3"
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 40px rgba(251,146,60,0.5)' }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                        {loading ? (
                            <motion.div
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Sign In
                            </>
                        )}
                    </span>
                </motion.button>
            </form>

            <div className="mt-8 text-center border-t border-zinc-800/50 pt-6">
                <p className="text-zinc-500 text-sm">New to the Party?</p>
                <motion.button
                    onClick={() => { setIsFlipped(true); setError(''); }}
                    className="text-orange-400 font-semibold mt-3 inline-flex items-center gap-2 text-base group relative"
                    whileHover={{ scale: 1.05, textShadow: "0 0 8px rgba(251, 146, 60, 0.6)" }}
                >
                    Get Registered
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </motion.button>
            </div>
        </div>
    );
};

export default LoginForm;
