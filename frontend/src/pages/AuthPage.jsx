import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for upload
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';
import ParticleBackground from '../components/ParticleBackground';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

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
        companyName: '', description: '',
        logo: '', avatar: '', // Add avatar field
        terms: false
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

        return null;
    };

    const handleLogoUpload = async (e, type = 'logo') => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setError(`${type === 'logo' ? 'Logo' : 'Avatar'} size must be less than 2MB`);
            return;
        }

        setUploadingLogo(true);
        setError('');

        const formData = new FormData();
        formData.append(type === 'logo' ? 'logo' : 'avatar', file); // Field name matches middleware

        try {
            const endpoint = type === 'logo' ? `${API_URL}/api/upload/logo` : `${API_URL}/api/upload/avatar`;
            const res = await axios.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (type === 'logo') {
                setSignupData(prev => ({ ...prev, logo: res.data.url }));
            } else {
                setSignupData(prev => ({ ...prev, avatar: res.data.url }));
            }
            setLogoPreview(URL.createObjectURL(file));
        } catch (err) {
            setError(`Failed to upload ${type}. Please try again.`);
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
                ...(signupData.role === 'user' && {
                    avatar: signupData.avatar
                }),
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
                setSuccess('Verification successful! Logging in...');
                setTimeout(() => {
                    window.location.reload();
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
                    <LoginForm
                        loginData={loginData}
                        handleLoginChange={handleLoginChange}
                        handleLogin={handleLogin}
                        loading={loading}
                        setIsFlipped={setIsFlipped}
                        setError={setError}
                    />

                    <SignupForm
                        signupData={signupData}
                        handleSignupChange={handleSignupChange}
                        handleSignup={handleSignup}
                        handleVerifyOTP={handleVerifyOTP}
                        handleResendOTP={handleResendOTP}
                        showOTP={showOTP}
                        otp={otp}
                        setOtp={setOtp}
                        loading={loading}
                        setIsFlipped={setIsFlipped}
                        setError={setError}
                        setSuccess={setSuccess}
                        handleLogoUpload={handleLogoUpload}
                        uploadingLogo={uploadingLogo}
                        logoPreview={logoPreview}
                        setSignupData={setSignupData}
                    />
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
