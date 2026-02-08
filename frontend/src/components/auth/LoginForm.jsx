import React from 'react';
import { motion } from 'framer-motion';

const LoginForm = ({ loginData, handleLoginChange, handleLogin, loading, setIsFlipped, setError, onForgotPassword }) => {

    return (
        <div
            className="w-full h-auto max-h-[85vh] bg-[#12121a]/80 backdrop-blur-xl px-4 py-6 md:px-6 md:py-8 rounded-3xl justify-center items-center border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
        >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            {/* Header */}
            <div className="text-center mb-6 relative z-10 flex-shrink-0">
                <motion.div
                    className="inline-block mb-3"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <img src="/logo.png" alt="Logo" className="w-12 h-12 md:w-16 md:h-16 drop-shadow-[0_0_20px_rgba(255,102,0,0.6)]" />
                </motion.div>
                <h1 className="text-2xl md:text-3xl font-bold font-creepster text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 tracking-wider drop-shadow-sm">
                    Phantom Agency
                </h1>
                <p className="text-zinc-500 text-[9px] md:text-[10px] uppercase tracking-[0.3em] mt-1 font-medium">
                    Enter the Realm
                </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5 relative z-10 w-full">
                {/* Email Field */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Email Address</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                        </div>
                        <input
                            type="email" name="email" value={loginData.email} onChange={handleLoginChange} required
                            className="w-full bg-[#0a0a0f]/80 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500 block w-full pl-10 p-3.5 transition-all duration-300 placeholder-zinc-600 shadow-inner"
                            placeholder="spirit@phantom.realm"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Password</label>
                        <button type="button" onClick={onForgotPassword} className="text-[10px] text-orange-400 hover:text-orange-300 transition-colors font-medium">
                            Forgot Spell?
                        </button>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <input
                            type="password" name="password" value={loginData.password} onChange={handleLoginChange} required
                            className="w-full bg-[#0a0a0f]/80 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500 block w-full pl-10 p-3.5 transition-all duration-300 placeholder-zinc-600 shadow-inner"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <motion.button
                    type="submit" disabled={loading}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wide mt-2"
                >
                    {loading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        'Sign In'
                    )}
                </motion.button>

                {/* Switch Mode */}
                <div className="text-center pt-2">
                    <p className="text-zinc-500 text-xs">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={() => { setIsFlipped(true); setError(''); }}
                            className="text-orange-400 hover:text-orange-300 font-bold ml-1 transition-colors"
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </form>

        </div>
    );
};

export default LoginForm;