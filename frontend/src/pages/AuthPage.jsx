import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for upload
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';
import ParticleBackground from '../components/ParticleBackground';



const AuthPage = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const target = user.role === 'admin' ? '/admin' :
                user.role === 'provider' ? '/provider' : '/services';
            navigate(target);
        }
    }, [user, navigate]);

    const [isFlipped, setIsFlipped] = useState(() => {
        return localStorage.getItem('auth_mode') === 'signup';
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({
        name: '', email: '', password: '', confirmPassword: '', role: 'user',
        phone: '', city: '', state: '',
        companyName: '', description: '', secretKey: '',
        logo: '', // Add logo field
        terms: false // Add terms field
    });
    const [logoPreview, setLogoPreview] = useState(null); // Preview state
    const [uploadingLogo, setUploadingLogo] = useState(false); // Upload state
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');

    // Persist auth mode to localStorage and clear messages on switch
    useEffect(() => {
        localStorage.setItem('auth_mode', isFlipped ? 'signup' : 'login');
        setError('');
        setSuccess('');
    }, [isFlipped]);

    // Auto-dismiss messages
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    // Validation helpers
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const validateSignup = () => {
        if (!signupData.name.trim()) return 'Name is required';
        if (!emailRegex.test(signupData.email)) return 'Invalid email format';
        if (!strongPasswordRegex.test(signupData.password)) {
            return 'Password must be 8+ chars with uppercase, lowercase, number & special character';
        }
        if (signupData.password !== signupData.confirmPassword) return 'Passwords do not match';
        if (signupData.role === 'provider') {
            if (!signupData.companyName.trim()) return 'Company name is required';
            if (!signupData.logo) return 'Company logo is required for verification';
            if (!signupData.terms) return 'You must agree to the Terms & Conditions';
        }
        if (signupData.role === 'admin' && !signupData.secretKey.trim()) return 'Admin key is required';
        return null;
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setError('Logo size must be less than 2MB');
            return;
        }

        setUploadingLogo(true);
        setError('');

        const formData = new FormData();
        formData.append('logo', file);

        try {
            const res = await axios.post(`${API_URL}/api/upload/logo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSignupData(prev => ({ ...prev, logo: res.data.url }));
            setLogoPreview(URL.createObjectURL(file));
        } catch (err) {
            setError('Failed to upload logo. Please try again.');
            console.error(err);
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleSignupChange = (e) => setSignupData({ ...signupData, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const userData = await login(loginData.email.trim(), loginData.password);
            if (userData.role === 'admin') navigate('/admin');
            else if (userData.role === 'provider') navigate('/provider');
            else navigate('/services');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Frontend validation
        const validationError = validateSignup();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            const endpoint = `${API_URL}/auth/signup`;

            const body = {
                name: signupData.name,
                email: signupData.email,
                password: signupData.password,
                role: signupData.role,
                phone: signupData.phone,
                city: signupData.city,
                state: signupData.state,
                ...(signupData.role === 'provider' && {
                    companyName: signupData.companyName,
                    description: signupData.description,
                    logo: signupData.logo // Include logo URL
                }),
                ...(signupData.role === 'admin' && { adminKey: signupData.secretKey })
            };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            if (data.requiresVerification) {
                setSuccess('Verification code sent! Check your email.');
                setTimeout(() => setSuccess(''), 3000);
                setShowOTP(true);
            } else {
                setSuccess('Registration successful! Redirecting...');
                setTimeout(() => {
                    setIsFlipped(false);
                    setSuccess('');
                }, 2000);
            }
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signupData.email, otp })
            });
            const data = await res.json();

            if (res.ok) {
                // Auto-login: Update user context and redirect
                setSuccess('Verification successful! Logging in...');
                setTimeout(() => {
                    const target = data.role === 'admin' ? '/admin' :
                        data.role === 'provider' ? '/provider' : '/services';
                    // Force reload to pick up cookies/auth state if context doesn't update fast enough
                    // or just use navigate if we update context manually

                    // Since we are not updating context manually properly here (need to call checkAuth or similar),
                    // reload is safer to sync with backend cookies.
                    // But wait, the previous code had window.location.reload().
                    // Let's rely on that or use login function from context if we had token.
                    // Actually, verifyOTP sets cookie. Reload is easiest.
                    window.location.reload();
                    // navigate(target); // Reload will handle navigation based on auth check
                }, 1000);
            } else {
                throw new Error(data.message);
            }

        } catch (err) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`${API_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signupData.email })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message);
            }

            setSuccess('New code sent!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0f]">
            {/* Particle Field Background */}
            <ParticleBackground />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]/80 z-[1]"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-violet-950/30 to-transparent z-[1]"></div>

            {/* Main Container */}
            <motion.div
                className="relative z-10 w-full max-w-md mx-4"
                style={{ perspective: '1500px' }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <motion.div
                    className="relative w-full"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.7, type: 'spring', stiffness: 50, damping: 12 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* ========== LOGIN CARD ========== */}
                    <div
                        className={`w-full bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 backdrop-blur-2xl p-8 rounded-3xl border border-white/5 shadow-[0_0_80px_rgba(168,85,247,0.15)] ${isFlipped ? 'pointer-events-none' : ''}`}
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        {/* Logo Section - Consistent Sizing */}
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

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="mb-5 p-3 bg-red-950/50 text-red-400 rounded-xl text-sm border border-red-500/30 text-center backdrop-blur-sm flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

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

                    {/* ========== SIGNUP CARD ========== */}
                    <div
                        className={`w-full bg-gradient-to-br from-zinc-900/95 via-violet-950/30 to-zinc-950/95 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-violet-500/10 shadow-[0_0_80px_rgba(168,85,247,0.15)] absolute top-0 left-0 flex flex-col overflow-hidden ${!isFlipped ? 'pointer-events-none' : ''}`}
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', maxHeight: 'min(90vh, 720px)' }}
                    >
                        {/* Logo Section - Consistent Sizing */}
                        <div className="flex flex-col items-center mb-6">
                            <motion.div
                                className="relative"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-violet-500/20 rounded-full blur-xl"></div>
                                <img
                                    src="/logo.png"
                                    alt="Phantom Agency"
                                    className="w-20 h-20 relative z-10 drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]"
                                />
                            </motion.div>
                            <h2
                                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-300 to-violet-500 bg-clip-text text-transparent mt-4 pb-1"
                                style={{ fontFamily: 'Creepster, cursive', lineHeight: '1.2' }}
                            >
                                Create Account
                            </h2>
                            <p className="text-zinc-400 text-xs tracking-[0.2em] uppercase mt-2">Enter the Party</p>
                        </div>

                        <AnimatePresence>
                            {(error || success) && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`mb-4 p-3 rounded-xl text-sm text-center border backdrop-blur-sm ${success ? 'bg-green-950/50 text-green-400 border-green-500/30' : 'bg-red-950/50 text-red-400 border-red-500/30'}`}
                                >
                                    {success || error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Scrollable form fields OR OTP Form */}
                        {!showOTP ? (
                            <>
                                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1" style={{ maxHeight: '320px' }}>
                                    {/* Name & Role Row */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative group">
                                            <label className="text-xs text-zinc-400 mb-1 block font-medium">Full Name</label>
                                            <div className="relative">
                                                <input
                                                    type="text" name="name" value={signupData.name} onChange={handleSignupChange} required
                                                    className="w-full p-3 pl-10 bg-zinc-800/60 rounded-xl text-white border border-zinc-700/50 focus:border-violet-500/50 focus:bg-zinc-800/80 outline-none placeholder-zinc-600 text-sm transition-all"
                                                    placeholder="John Doe"
                                                />
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-400 mb-1 block font-medium">Account Type</label>
                                            <select
                                                name="role" value={signupData.role} onChange={handleSignupChange}
                                                className="w-full p-3 bg-zinc-800/60 rounded-xl text-white border border-zinc-700/50 focus:border-violet-500/50 outline-none text-sm cursor-pointer transition-all"
                                            >
                                                <option value="user">Customer (User)</option>
                                                <option value="provider">Service Provider</option>
                                                <option value="admin">Administrator</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Email Field */}
                                    <div className="relative group">
                                        <label className="text-xs text-zinc-400 mb-1 block font-medium">Email Address</label>
                                        <div className="relative">
                                            <input
                                                type="email" name="email" value={signupData.email} onChange={handleSignupChange} required
                                                className="w-full p-3 pl-10 bg-zinc-800/60 rounded-xl text-white border border-zinc-700/50 focus:border-violet-500/50 focus:bg-zinc-800/80 outline-none placeholder-zinc-600 text-sm transition-all"
                                                placeholder="your@email.com"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-400 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div className="relative group">
                                        <label className="text-xs text-zinc-400 mb-1 block font-medium">Password</label>
                                        <div className="relative">
                                            <input
                                                type="password" name="password" value={signupData.password} onChange={handleSignupChange} required
                                                className="w-full p-3 pl-10 bg-zinc-800/60 rounded-xl text-white border border-zinc-700/50 focus:border-violet-500/50 focus:bg-zinc-800/80 outline-none placeholder-zinc-600 text-sm transition-all"
                                                placeholder="••••••••"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-400 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="relative group">
                                        <label className="text-xs text-zinc-400 mb-1 block font-medium">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type="password" name="confirmPassword" value={signupData.confirmPassword} onChange={handleSignupChange} required
                                                className="w-full p-3 pl-10 bg-zinc-800/60 rounded-xl text-white border border-zinc-700/50 focus:border-violet-500/50 focus:bg-zinc-800/80 outline-none placeholder-zinc-600 text-sm transition-all"
                                                placeholder="••••••••"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-400 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Phone & Location Fields */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="relative group">
                                            <label className="text-xs text-zinc-400 mb-1 block font-medium">Phone</label>
                                            <input
                                                type="tel" name="phone" value={signupData.phone} onChange={handleSignupChange}
                                                className="w-full p-3 bg-zinc-800/60 rounded-xl text-white border border-zinc-700/50 focus:border-violet-500/50 outline-none placeholder-zinc-600 text-sm transition-all"
                                                placeholder="Phone"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <label className="text-xs text-zinc-400 mb-1 block font-medium">City</label>
                                            <input
                                                type="text" name="city" value={signupData.city} onChange={handleSignupChange}
                                                className="w-full p-3 bg-zinc-800/60 rounded-xl text-white border border-zinc-700/50 focus:border-violet-500/50 outline-none placeholder-zinc-600 text-sm transition-all"
                                                placeholder="City"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <label className="text-xs text-zinc-400 mb-1 block font-medium">State</label>
                                            <input
                                                type="text" name="state" value={signupData.state} onChange={handleSignupChange}
                                                className="w-full p-3 bg-zinc-800/60 rounded-xl text-white border border-zinc-700/50 focus:border-violet-500/50 outline-none placeholder-zinc-600 text-sm transition-all"
                                                placeholder="State"
                                            />
                                        </div>
                                    </div>

                                    {/* Dynamic Role-based Fields */}
                                    <AnimatePresence>
                                        {signupData.role === 'provider' && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                className="space-y-4 pt-2 border-t border-zinc-700/30"
                                            >
                                                <input
                                                    type="text"
                                                    name="companyName"
                                                    placeholder="Company Name"
                                                    value={signupData.companyName}
                                                    onChange={handleSignupChange}
                                                    required
                                                    className="w-full p-3 bg-zinc-800/60 rounded-xl text-white border border-gray-600 focus:border-purple-500 outline-none transition-all placeholder-gray-400 text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    name="description"
                                                    placeholder="Description (Optional)"
                                                    value={signupData.description}
                                                    onChange={handleSignupChange}
                                                    className="w-full p-3 bg-zinc-800/60 rounded-xl text-white border border-gray-600 focus:border-purple-500 outline-none transition-all placeholder-gray-400 text-sm"
                                                />


                                                {/* Logo Upload */}
                                                <div className="relative group">
                                                    <label className="text-xs text-zinc-400 mb-2 block font-medium">Company Logo (Required)</label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                                            {uploadingLogo ? (
                                                                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                                            ) : logoPreview ? (
                                                                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleLogoUpload}
                                                                className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20 cursor-pointer"
                                                            />
                                                            <p className="text-[10px] text-zinc-500 mt-1">Max 2MB. JPG, PNG only.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 pt-2">
                                                    <input
                                                        type="checkbox"
                                                        name="terms"
                                                        id="signup-terms"
                                                        checked={signupData.terms}
                                                        onChange={(e) => setSignupData({ ...signupData, terms: e.target.checked })}
                                                        required
                                                        className="accent-purple-500 w-4 h-4 cursor-pointer"
                                                    />
                                                    <label htmlFor="signup-terms" className="text-xs text-zinc-400 cursor-pointer">
                                                        I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 transition-colors">Terms & Conditions</a>
                                                    </label>
                                                </div>
                                            </motion.div>
                                        )}
                                        {signupData.role === 'admin' && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                className="pt-2 border-t border-zinc-700/30"
                                            >
                                                <p className="text-xs text-violet-400 font-medium mb-2">Admin Verification</p>
                                                <input type="password" name="secretKey" value={signupData.secretKey} onChange={handleSignupChange} required
                                                    className="w-full p-3 bg-zinc-800/60 rounded-xl text-white border border-violet-500/40 focus:border-violet-400 outline-none placeholder-zinc-600 text-sm"
                                                    placeholder="Enter Admin Secret Key" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Create Account Button */}
                                <form onSubmit={handleSignup} className="mt-4 pt-3 border-t border-zinc-700/20 flex-shrink-0">
                                    <motion.button
                                        type="submit" disabled={loading}
                                        className="w-full py-3.5 bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600 text-white font-bold rounded-xl shadow-[0_4px_30px_rgba(168,85,247,0.35)] relative overflow-hidden group"
                                        whileHover={{ scale: 1.02, boxShadow: '0 8px 40px rgba(168,85,247,0.5)' }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {loading ? (
                                                <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                    </svg>
                                                    Sign Up
                                                </>
                                            )}
                                        </span>
                                    </motion.button>
                                </form>
                            </>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="flex-1 flex flex-col justify-center space-y-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-violet-500/30">
                                        <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Check your Email</h3>
                                    <p className="text-zinc-400 text-sm">We sent a 6-digit code to <br /><span className="text-violet-400 font-medium">{signupData.email}</span></p>
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        maxLength={6}
                                        className="w-full text-center text-2xl md:text-3xl tracking-[0.4em] md:tracking-[0.5em] font-bold bg-zinc-800/60 p-4 rounded-xl border-2 border-violet-500/30 focus:border-violet-500 outline-none text-white transition-all placeholder-zinc-600"
                                        placeholder="------"
                                        autoFocus
                                        required
                                    />
                                    <p className="text-center text-xs text-zinc-500 mt-2">Enter the 6-digit verification code</p>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <motion.button
                                        type="submit" disabled={loading || otp.length !== 6}
                                        className="w-full py-3.5 bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600 text-white font-bold rounded-xl shadow-[0_4px_30px_rgba(168,85,247,0.35)] relative overflow-hidden group disabled:opacity-50"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {loading ? 'Verifying...' : 'Verify Email'}
                                    </motion.button>

                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={loading}
                                        className="w-full text-sm text-zinc-400 hover:text-violet-400 transition-colors"
                                    >
                                        Didn't receive code? Resend
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Back to Login - Only show when NOT on OTP screen */}
                        {!showOTP && (
                            <div className="mt-5 text-center border-t border-zinc-800/50 pt-4">
                                <motion.button
                                    onClick={() => { setIsFlipped(false); setError(''); setSuccess(''); }}
                                    className="text-violet-400 font-medium text-sm inline-flex items-center gap-2 group relative"
                                    whileHover={{ scale: 1.05, textShadow: "0 0 8px rgba(167, 139, 250, 0.6)" }}
                                >
                                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                    </svg>
                                    Back to Login
                                </motion.button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            <style>{`
                html, body { overflow: hidden; }
                /* Custom Scrollbar Styling - Hidden */
                .custom-scrollbar::-webkit-scrollbar { width: 0px; display: none; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(167, 139, 250, 0.3); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(167, 139, 250, 0.5); }
                .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(167, 139, 250, 0.3) rgba(255, 255, 255, 0.05); }
            `}</style>
        </div >
    );
};

export default AuthPage;
