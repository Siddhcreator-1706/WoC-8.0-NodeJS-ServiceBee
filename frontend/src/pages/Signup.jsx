import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Signup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1 = form, 2 = OTP verification
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }
        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email.trim(), // Preserve dots in email
                    password: formData.password
                })
            });

            const data = await res.json();
            if (res.ok && data.requiresVerification) {
                setMessage('Verification code sent to your email!');
                setStep(2);
            } else {
                setError(data.message || 'Signup failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: formData.email.trim(), otp })
            });

            const data = await res.json();
            if (res.ok) {
                navigate('/');
                window.location.reload(); // Refresh to update auth state
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email.trim() })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('New verification code sent!');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-orange-400 mb-2" style={{ fontFamily: 'Creepster, cursive' }}>
                        🎃 ServiceBee
                    </h1>
                    <p className="text-gray-400">
                        {step === 1 ? 'Create your account' : 'Verify your email'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>
                )}
                {message && (
                    <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded-lg text-sm">{message}</div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Name</label>
                            <input
                                type="text" name="name" value={formData.name} onChange={handleChange} required
                                className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Email</label>
                            <input
                                type="email" name="email" value={formData.email} onChange={handleChange} required
                                className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="your.email@gmail.com"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Password</label>
                            <input
                                type="password" name="password" value={formData.password} onChange={handleChange} required
                                className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="Min 6 characters"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm mb-1">Confirm Password</label>
                            <input
                                type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                                className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="Confirm password"
                            />
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Sign Up'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div className="text-center text-gray-400 mb-4">
                            <p>Enter the 6-digit code sent to</p>
                            <p className="text-orange-400 font-medium">{formData.email}</p>
                        </div>
                        <div>
                            <input
                                type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6} required
                                className="w-full p-4 bg-gray-700 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="000000"
                            />
                        </div>
                        <button
                            type="submit" disabled={loading || otp.length !== 6}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>
                        <div className="flex justify-between text-sm">
                            <button type="button" onClick={() => setStep(1)} className="text-gray-400 hover:text-white">
                                ← Change email
                            </button>
                            <button type="button" onClick={handleResendOTP} disabled={loading} className="text-orange-400 hover:text-orange-300">
                                Resend code
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 text-center text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-orange-400 hover:text-orange-300">Login</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
