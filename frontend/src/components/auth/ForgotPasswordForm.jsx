import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';


const ForgotPasswordForm = ({ onBack }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('/auth/forgot-password', { email });
            setStep(2);
            setSuccess('Verification code sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/auth/verify-reset-otp', { email, otp });
            setResetToken(res.data.resetToken);
            setStep(3);
            setSuccess('Code verified! Set your new password.');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await axios.post('/auth/reset-password', { resetToken, newPassword: password });
            setSuccess('Password reset successful! Logging you in...');
            setTimeout(() => {
                onBack(); // Go back to login
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="w-full h-auto max-h-[85vh] bg-[#12121a]/80 backdrop-blur-xl px-4 py-6 md:px-6 md:py-8 rounded-3xl justify-center items-center border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden"
        >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="text-center mb-4 relative z-10 flex-shrink-0">
                <motion.div
                    className="inline-block mb-2"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <img src="/logo.png" alt="Logo" className="w-12 h-12 md:w-16 md:h-16 drop-shadow-[0_0_20px_rgba(255,102,0,0.6)] mx-auto" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold font-creepster text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 tracking-wider drop-shadow-sm mt-1">
                    {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify Identity' : 'Reset Password'}
                </h2>
                <p className="text-zinc-500 text-[9px] md:text-xs uppercase tracking-[0.3em] mt-1 font-medium">
                    {step === 1 ? 'Recover your phantom key' : step === 2 ? 'Enter the secret code' : 'Set a new spell'}
                </p>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleRequestOTP} className="space-y-4 relative z-10 w-full">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                    className="w-full bg-[#0a0a0f]/80 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500 block w-full pl-10 p-3 transition-all duration-300 placeholder-zinc-600 shadow-inner"
                                    placeholder="spirit@phantom.realm"
                                />
                            </div>
                        </div>
                        <motion.button
                            type="submit" disabled={loading}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wide"
                        >
                            {loading ? 'Sending...' : 'Send Verification Code'}
                        </motion.button>
                    </motion.form>
                )}

                {step === 2 && (
                    <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerifyOTP} className="space-y-4 relative z-10 w-full">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider block text-center">Enter 6-Digit Code</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full text-center text-2xl tracking-[0.5em] font-bold bg-[#0a0a0f]/60 pl-10 pr-3 py-3 rounded-xl border border-orange-500/30 focus:border-orange-500 outline-none text-white transition-all placeholder-zinc-700 shadow-inner"
                                    placeholder="000000" maxLength={6} required autoFocus
                                />
                            </div>
                            <p className="text-center text-[10px] text-zinc-500">Sent to <span className="text-orange-400">{email}</span></p>
                        </div>
                        <div className="space-y-2">
                            <motion.button
                                type="submit" disabled={loading}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wide"
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </motion.button>
                            <button type="button" onClick={() => setStep(1)} className="w-full text-[10px] text-zinc-500 hover:text-orange-400 transition-colors bg-white/5 py-1.5 rounded-lg border border-white/5">
                                Wrong email? Go Back
                            </button>
                        </div>
                    </motion.form>
                )}

                {step === 3 && (
                    <motion.form key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleResetPassword} className="space-y-4 relative z-10 w-full">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">New Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                                    className="w-full bg-[#0a0a0f]/80 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500 block w-full pl-10 p-3 transition-all duration-300 placeholder-zinc-600 shadow-inner"
                                    placeholder="New secret..."
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-400 ml-1 uppercase tracking-wider">Confirm Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6}
                                    className="w-full bg-[#0a0a0f]/80 border border-zinc-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500 block w-full pl-10 p-3 transition-all duration-300 placeholder-zinc-600 shadow-inner"
                                    placeholder="Confirm secret..."
                                />
                            </div>
                        </div>
                        <motion.button
                            type="submit" disabled={loading}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wide"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </motion.button>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="mt-4 text-center z-10">
                <button
                    onClick={onBack}
                    className="text-zinc-400 hover:text-white transition-colors text-xs flex items-center justify-center gap-1 mx-auto group font-medium"
                >
                    <svg className="w-3 h-3 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
