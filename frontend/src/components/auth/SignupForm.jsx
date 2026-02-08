import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SignupForm = ({
    signupData,
    handleSignupChange,
    handleSignup,
    handleVerifyOTP,
    handleResendOTP,
    showOTP,
    otp,
    setOtp,
    loading,
    setIsFlipped,
    setError,
    setSuccess,
    handleLogoUpload,
    uploadingLogo,
    logoPreview,
    setSignupData,
    handleAvatarChange,
    uploadingAvatar
}) => {
    return (
        <div
            className="w-full h-auto max-h-[85vh] bg-[#12121a]/80 backdrop-blur-xl px-4 py-6 md:px-6 md:py-8 rounded-3xl justify-center items-center border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
        >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            {/* Header */}
            <div className="text-center mb-6 relative z-10 flex-shrink-0">
                <motion.div
                    className="inline-block"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <img src="/logo.png" alt="Logo" className="w-12 h-12 md:w-16 md:h-16 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold font-creepster text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-purple-400 to-violet-500 tracking-wider mt-1">
                    Join the Coven
                </h2>
                <p className="text-zinc-500 text-[9px] md:text-[10px] uppercase tracking-[0.3em] mt-1 font-medium">
                    Create your phantom identity
                </p>
            </div>

            {/* Scrollable Form Area */}
            {!showOTP ? (
                <form onSubmit={handleSignup} className="flex-1 flex flex-col min-h-0 relative z-10 w-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-1 py-1 relative z-20" data-lenis-prevent>
                        <div className="space-y-4 pb-2">
                            {/* Name & Role Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text" name="name" value={signupData.name} onChange={handleSignupChange} required
                                        className="w-full bg-[#0a0a0f]/60 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 p-3 transition-all placeholder-zinc-600"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">Role</label>
                                    <div className="relative">
                                        <select
                                            name="role" value={signupData.role} onChange={handleSignupChange}
                                            className="w-full bg-[#0a0a0f]/60 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 p-3 transition-all cursor-pointer appearance-none"
                                        >
                                            <option value="user" className="bg-[#0a0a0f] text-white">Customer</option>
                                            <option value="provider" className="bg-[#0a0a0f] text-white">Provider</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">Email</label>
                                <input
                                    type="email" name="email" value={signupData.email} onChange={handleSignupChange} required
                                    className="w-full bg-[#0a0a0f]/60 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 p-3 transition-all placeholder-zinc-600"
                                    placeholder="ghost@example.com"
                                />
                            </div>

                            {/* Password & Confirm */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">Password</label>
                                    <input
                                        type="password" name="password" value={signupData.password} onChange={handleSignupChange} required
                                        className="w-full bg-[#0a0a0f]/60 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 p-3 transition-all placeholder-zinc-600"
                                        placeholder="••••••"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">Confirm</label>
                                    <input
                                        type="password" name="confirmPassword" value={signupData.confirmPassword} onChange={handleSignupChange} required
                                        className="w-full bg-[#0a0a0f]/60 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 p-3 transition-all placeholder-zinc-600"
                                        placeholder="••••••"
                                    />
                                </div>
                            </div>

                            {/* Phone & Location */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">Phone</label>
                                    <input
                                        type="tel" name="phone" value={signupData.phone} onChange={handleSignupChange}
                                        className="w-full bg-[#0a0a0f]/60 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 p-3 transition-all placeholder-zinc-600"
                                        placeholder="123..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">City</label>
                                    <input
                                        type="text" name="city" value={signupData.city} onChange={handleSignupChange}
                                        className="w-full bg-[#0a0a0f]/60 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 p-3 transition-all placeholder-zinc-600"
                                        placeholder="City"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">State</label>
                                    <input
                                        type="text" name="state" value={signupData.state} onChange={handleSignupChange}
                                        className="w-full bg-[#0a0a0f]/60 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 p-3 transition-all placeholder-zinc-600"
                                        placeholder="State"
                                    />
                                </div>
                            </div>

                            {/* Dynamic Fields: User (Avatar & Bio) */}
                            <AnimatePresence>
                                {signupData.role === 'user' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 pt-2 border-t border-white/5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">Profile Avatar</label>
                                            <div className="flex items-center gap-3 bg-[#0a0a0f]/40 p-2 rounded-xl border border-zinc-800/50">
                                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                                                    {uploadingAvatar ? <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /> : signupData.avatar ? <img src={signupData.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                                                </div>
                                                <input
                                                    type="file" accept="image/*" onChange={handleAvatarChange}
                                                    className="text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-violet-500/10 file:text-violet-400 hover:file:bg-violet-500/20 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">Bio</label>
                                            <textarea
                                                name="description" value={signupData.description} onChange={handleSignupChange}
                                                className="w-full bg-[#0a0a0f]/60 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 p-3 transition-all placeholder-zinc-600 resize-none h-16"
                                                placeholder="Tell us about your phantom self..."
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Dynamic Fields: Provider (Company Info) */}
                            <AnimatePresence>
                                {signupData.role === 'provider' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 pt-2 border-t border-white/5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">Company Name</label>
                                            <input
                                                type="text" name="companyName" value={signupData.companyName} onChange={handleSignupChange} required
                                                className="w-full bg-[#0a0a0f]/60 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 p-3 transition-all placeholder-zinc-600"
                                                placeholder="Phantom Services Ltd."
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">Company Logo</label>
                                            <div className="flex items-center gap-3 bg-[#0a0a0f]/40 p-2 rounded-xl border border-zinc-800/50">
                                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                                                    {uploadingLogo ? <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /> : logoPreview ? <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-zinc-600 text-xs">IMG</span>}
                                                </div>
                                                <input
                                                    type="file" accept="image/*" onChange={handleLogoUpload}
                                                    className="text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-violet-500/10 file:text-violet-400 hover:file:bg-violet-500/20 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">About Company</label>
                                            <textarea
                                                name="description" value={signupData.description} onChange={handleSignupChange}
                                                className="w-full bg-[#0a0a0f]/60 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 p-3 transition-all placeholder-zinc-600 resize-none h-16"
                                                placeholder="Describe your spectral services..."
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Terms */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox" id="terms" checked={signupData.terms} onChange={(e) => setSignupData({ ...signupData, terms: e.target.checked })}
                                    className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
                                />
                                <label htmlFor="terms" className="text-xs text-zinc-500 cursor-pointer select-none">
                                    I agree to the <span className="text-violet-400 hover:text-violet-300">Terms & Conditions</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-2 text-center pt-2 border-t border-white/5 relative z-10 flex-shrink-0">
                        <motion.button
                            type="submit" disabled={loading}
                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                            className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-violet-900/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? 'Conjuring Account...' : 'Sign Up'}
                        </motion.button>


                        <div className="mt-2 text-center">
                            <button
                                type="button"
                                onClick={() => { setIsFlipped(false); setError(''); }}
                                className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back to Login
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                // OTP View
                <div className="flex-1 flex flex-col justify-center relative z-10">
                    <div className="text-center mb-4">
                        <div className="w-14 h-14 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-violet-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                            <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white">Check your Email</h3>
                        <p className="text-zinc-500 text-[10px] mt-1">Code sent to <span className="text-violet-400">{signupData.email}</span></p>
                    </div>

                    <div className="space-y-3">
                        <input
                            type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full text-center text-2xl tracking-[0.5em] font-bold bg-[#0a0a0f]/60 p-3 rounded-xl border border-violet-500/30 focus:border-violet-500 outline-none text-white transition-all placeholder-zinc-700"
                            placeholder="000000" autoFocus
                        />
                        <p className="text-center text-[10px] text-zinc-500">Enter the 6-digit phantom code</p>
                    </div>

                    <div className="mt-4 space-y-2">
                        <motion.button
                            onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}
                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                            className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify Identity'}
                        </motion.button>
                        <button onClick={handleResendOTP} disabled={loading} className="w-full text-[10px] text-zinc-500 hover:text-violet-400 transition-colors">
                            Didn't receive it? Resend
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignupForm;
