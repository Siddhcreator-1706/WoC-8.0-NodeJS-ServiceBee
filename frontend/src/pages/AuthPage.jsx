import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for upload
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';
import ParticleBackground from '../components/ParticleBackground';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

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
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({
        name: '', email: '', password: '', confirmPassword: '', role: 'user',
        phone: '', city: '', state: '',
        companyName: '', description: '',
        logo: '', avatar: '', // Add avatar field
        terms: false
    });
    const [logoPreview, setLogoPreview] = useState(null); // Preview state
    const [logoFile, setLogoFile] = useState(null); // File to upload
    const [avatarFile, setAvatarFile] = useState(null); // File to upload
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
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

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleSignupChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSignupData({
            ...signupData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Handle Logo Change (Preview Only)
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLogoFile(file);
        const objectUrl = URL.createObjectURL(file);
        setLogoPreview(objectUrl);
    };

    // Handle Avatar Change (Preview Only)
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAvatarFile(file);
        const objectUrl = URL.createObjectURL(file);
        setSignupData(prev => ({ ...prev, avatar: objectUrl }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(loginData.email, loginData.password);
            setSuccess('Welcome back!');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (signupData.password !== signupData.confirmPassword) {
            return setError('Passwords do not match');
        }
        if (signupData.role === 'provider' && !signupData.companyName) {
            return setError('Company Name is required for providers');
        }
        if (!signupData.terms) {
            return setError('Please accept the terms');
        }

        setLoading(true);

        let finalAvatarUrl = '';
        let finalLogoUrl = '';

        try {
            // Upload Avatar if exists
            if (avatarFile) {
                setUploadingAvatar(true);
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                try {
                    const res = await axios.post(`${API_URL}/api/upload/avatar`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        withCredentials: true
                    });
                    finalAvatarUrl = res.data.url;
                } catch (uploadErr) {
                    console.error("Avatar upload failed", uploadErr);
                    setLoading(false);
                    setUploadingAvatar(false);
                    return setError("Failed to upload avatar");
                }
                setUploadingAvatar(false);
            }

            // Upload Logo if exists
            if (logoFile) {
                setUploadingLogo(true);
                const formData = new FormData();
                formData.append('logo', logoFile);
                try {
                    const res = await axios.post(`${API_URL}/api/upload/logo`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        withCredentials: true
                    });
                    finalLogoUrl = res.data.url;
                } catch (uploadErr) {
                    console.error("Logo upload failed", uploadErr);
                    setLoading(false);
                    setUploadingLogo(false);
                    return setError("Failed to upload company logo");
                }
                setUploadingLogo(false);
            }

            // Prepare signup payload with real URLs
            const payload = {
                ...signupData,
                avatar: finalAvatarUrl || signupData.avatar,
                logo: finalLogoUrl || signupData.logo
            };

            const res = await axios.post(`${API_URL}/auth/signup`, payload);

            setSuccess('Verification code sent to your email!');
            setShowOTP(true);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/verify-otp`, {
                email: signupData.email,
                otp
            });

            const {data} = res;

            // Auto-login logic handled by backend setting cookies, but we might need to update context user
            // The backend returns user data on success
            // We can manually set user in context if we had a method, but context strictly updates on /me or login.
            // Actually, context.login calls API.
            // Here we just verified. We should probably force a user reload or redirect.
            // The backend verifyOTP also logs the user in (sets cookies).
            // So we can just reload the window or let the AuthContext checkAuth re-run?
            // AuthContext runs checkAuth on mount.
            // We should use window.location.reload() or a context method to refresh.
            // But standard SPA way: update user state.
            // Check if AuthContext exposes 'setUser' or 'checkAuth'?
            // It exposes 'updateUser' but that merges state.
            // It exposes 'user'.
            // Simple fix: reload page to trigger checkAuth, OR rely on navigate triggering re-render if we had a way to signal.
            // But since we are inside the page, we can simply:
            window.location.href = data.role === 'admin' ? '/admin' :
                data.role === 'provider' ? '/provider' : '/services';

        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/resend-otp`, {
                email: signupData.email
            });
            setSuccess('Verification code resent!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0f0f13] flex items-center justify-center p-4 relative font-sans">
            <ParticleBackground />

            {/* Error/Success Messages */}
            <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 space-y-2 pointer-events-none">
                {error && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/10 backdrop-blur-md border border-red-500/50 text-red-500 px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)] text-center font-medium">
                        {error}
                    </motion.div>
                )}
                {success && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-500/10 backdrop-blur-md border border-green-500/50 text-green-500 px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.2)] text-center font-medium">
                        {success}
                    </motion.div>
                )}
            </div>

            <div className="relative z-10 w-full max-w-md md:max-w-lg perspective-1000">
                <AnimatePresence mode="wait">
                    {showForgotPassword ? (
                        <ForgotPasswordForm key="forgot-password" onBack={() => setShowForgotPassword(false)} />
                    ) : (
                        <motion.div
                            key="auth-forms"
                            className="relative w-full transform-style-3d"
                            initial={false}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                        >
                            {/* Front Side: Login */}
                            <div
                                className={`w-full backface-hidden flex flex-col items-center justify-center ${isFlipped ? 'absolute inset-0 pointer-events-none' : 'relative z-20 pointer-events-auto'}`}
                                style={{ transform: 'rotateY(0deg)', transformStyle: 'preserve-3d' }}
                            >
                                <LoginForm
                                    loginData={loginData}
                                    handleLoginChange={handleLoginChange}
                                    handleLogin={handleLogin}
                                    loading={loading}
                                    setIsFlipped={setIsFlipped}
                                    setError={setError}
                                    onForgotPassword={() => setShowForgotPassword(true)}
                                />
                            </div>

                            {/* Back Side: Signup */}
                            <div
                                className={`w-full backface-hidden flex flex-col items-center justify-center ${isFlipped ? 'relative z-20 pointer-events-auto' : 'absolute inset-0 pointer-events-none'}`}
                                style={{ transform: 'rotateY(180deg)', transformStyle: 'preserve-3d' }}
                            >
                                <SignupForm
                                    signupData={signupData}
                                    handleSignupChange={handleSignupChange}
                                    handleSignup={handleSignup}
                                    handleVerifyOTP={handleVerifyOTP}
                                    handleResendOTP={handleResendOTP}
                                    handleLogoChange={handleLogoChange}
                                    handleLogoUpload={handleLogoChange}
                                    logoPreview={logoPreview}
                                    uploadingLogo={uploadingLogo}
                                    loading={loading}
                                    setIsFlipped={setIsFlipped}
                                    showOTP={showOTP}
                                    otp={otp}
                                    setOtp={setOtp}
                                    handleAvatarChange={handleAvatarChange}
                                    uploadingAvatar={uploadingAvatar}
                                    setError={setError}
                                    setSuccess={setSuccess}
                                    setSignupData={setSignupData}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AuthPage;
