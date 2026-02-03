import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import API_URL from '../config/api';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email.trim(), formData.password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setForgotMessage('');

        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail.trim() })
            });

            const data = await res.json();
            setForgotMessage(data.message);
        } catch (err) {
            setForgotMessage('Error sending reset email');
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
                        {showForgot ? 'Reset your password' : 'Welcome back!'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>
                )}

                {!showForgot ? (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    placeholder="Your password"
                                />
                            </div>
                            <button
                                type="submit" disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                        <div className="mt-4 text-center">
                            <button onClick={() => setShowForgot(true)} className="text-sm text-purple-400 hover:text-purple-300">
                                Forgot password?
                            </button>
                        </div>
                        <div className="mt-4 text-center text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-orange-400 hover:text-orange-300">Sign Up</Link>
                        </div>
                    </>
                ) : (
                    <>
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div>
                                <label className="block text-gray-300 text-sm mb-1">Email</label>
                                <input
                                    type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required
                                    className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    placeholder="your.email@gmail.com"
                                />
                            </div>
                            {forgotMessage && (
                                <div className="p-3 bg-green-500/20 text-green-400 rounded-lg text-sm">{forgotMessage}</div>
                            )}
                            <button
                                type="submit" disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                        <div className="mt-4 text-center">
                            <button onClick={() => setShowForgot(false)} className="text-sm text-gray-400 hover:text-white">
                                ← Back to login
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
