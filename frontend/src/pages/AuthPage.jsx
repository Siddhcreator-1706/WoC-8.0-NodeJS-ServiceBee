import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';

const AuthPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Login State
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    // Signup State
    const [signupData, setSignupData] = useState({
        name: '', email: '', password: '', role: 'user',
        companyName: '', serviceType: '', description: '', secretKey: ''
    });

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleSignupChange = (e) => setSignupData({ ...signupData, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(loginData.email.trim(), loginData.password);
            navigate('/services');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const endpoint = signupData.role === 'provider'
                ? `${API_URL}/auth/register-provider`
                : `${API_URL}/auth/register-user`;

            const body = {
                name: signupData.name,
                email: signupData.email,
                password: signupData.password,
                ...(signupData.role === 'provider' && {
                    companyName: signupData.companyName,
                    serviceType: signupData.serviceType,
                    description: signupData.description
                }),
                ...(signupData.role === 'admin' && { secretKey: signupData.secretKey })
            };

            // Convert admin role to user with secret key intent, handled by backend usually or specific route
            // Keeping it simple based on existing logic inferred. 
            // If admin logic is special, we'll stick to user registration for now unless "admin" role is explicit.
            if (signupData.role === 'admin') {
                // Assuming admin registration uses a specific flow or just user endpoint with a secret key
                // Reverting to inferred standard flow; adapt if needed.
                const adminRes = await fetch(`${API_URL}/auth/register-admin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...body, role: 'admin' })
                });
                if (!adminRes.ok) throw new Error((await adminRes.json()).message);
            } else {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
            }

            // Auto login or ask to login? Let's flip back to login
            setIsFlipped(false);
            setError('');
            alert('Registration successful! Please login.');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1509557965875-b8f4dd52ec53?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative overflow-hidden">
            {/* Dark Overlay with Halloween tint */}
            <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm"></div>

            {/* Floating Ghosts/Pumpkins Background Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">🎃</div>
                <div className="absolute bottom-20 right-20 text-6xl opacity-20 animate-pulse">👻</div>
                <div className="absolute top-1/2 left-1/4 text-4xl opacity-10 animate-spin-slow">🕸️</div>
            </div>

            <div className="relative z-10 w-full max-w-md perspective-1000">
                <motion.div
                    className="relative w-full preserve-3d transition-transform duration-700 ease-in-out"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front Face - LOGIN */}
                    <div className="w-full bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-orange-500/30 backface-hidden absolute-center-if-folded" style={{ backfaceVisibility: 'hidden' }}>
                        <div className="text-center mb-8">
                            <img src="/logo.png" alt="Logo" className="w-16 h-16 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(255,165,0,0.5)]" />
                            <h1 className="text-4xl font-bold text-orange-500 mb-2" style={{ fontFamily: 'Creepster, cursive' }}>
                                Phantom Agency
                            </h1>
                            <p className="text-gray-400">Enter if you dare...</p>
                        </div>

                        {error && <div className="mb-4 p-3 bg-red-900/30 text-red-400 rounded-lg text-sm border border-red-500/20 text-center">{error}</div>}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="group">
                                <input
                                    type="email" name="email" value={loginData.email} onChange={handleLoginChange} required
                                    className="w-full p-4 bg-gray-900/50 rounded-xl text-white border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none placeholder-gray-500"
                                    placeholder="dark.soul@email.com"
                                />
                            </div>
                            <div className="group">
                                <input
                                    type="password" name="password" value={loginData.password} onChange={handleLoginChange} required
                                    className="w-full p-4 bg-gray-900/50 rounded-xl text-white border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none placeholder-gray-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                type="submit" disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:from-orange-500 hover:to-red-500 transform hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)] disabled:opacity-50"
                            >
                                {loading ? 'Summoning...' : 'Enter Portal'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-500">New to the haunting?</p>
                            <button onClick={() => setIsFlipped(true)} className="text-orange-400 hover:text-orange-300 font-semibold mt-2 hover:underline">
                                Join the Coven
                            </button>
                        </div>
                    </div>

                    {/* Back Face - SIGNUP */}
                    <div className="w-full bg-gray-900/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-purple-500/30 absolute top-0 left-0 h-full overflow-y-auto custom-scrollbar" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-purple-500" style={{ fontFamily: 'Creepster, cursive' }}>
                                Join the Shadows
                            </h2>
                        </div>

                        {error && <div className="mb-4 p-3 bg-red-900/30 text-red-400 rounded-lg text-sm border border-red-500/20 text-center">{error}</div>}

                        <form onSubmit={handleSignup} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text" name="name" value={signupData.name} onChange={handleSignupChange} required
                                    className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:border-purple-500 outline-none"
                                    placeholder="Name"
                                />
                                <select
                                    name="role" value={signupData.role} onChange={handleSignupChange}
                                    className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:border-purple-500 outline-none"
                                >
                                    <option value="user">Souls (User)</option>
                                    <option value="provider">Phantom (Provider)</option>
                                    <option value="admin">Overlord (Admin)</option>
                                </select>
                            </div>

                            <input
                                type="email" name="email" value={signupData.email} onChange={handleSignupChange} required
                                className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:border-purple-500 outline-none"
                                placeholder="Email"
                            />
                            <input
                                type="password" name="password" value={signupData.password} onChange={handleSignupChange} required
                                className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:border-purple-500 outline-none"
                                placeholder="Password"
                            />

                            {/* Additional fields based on role */}
                            <AnimatePresence>
                                {signupData.role === 'provider' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                                        <input
                                            type="text" name="companyName" value={signupData.companyName} onChange={handleSignupChange} required
                                            className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:border-purple-500 outline-none"
                                            placeholder="Company Name"
                                        />
                                        <input
                                            type="text" name="serviceType" value={signupData.serviceType} onChange={handleSignupChange} required
                                            className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:border-purple-500 outline-none"
                                            placeholder="Service Type"
                                        />
                                        <textarea
                                            name="description" value={signupData.description} onChange={handleSignupChange} required
                                            className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:border-purple-500 outline-none h-20"
                                            placeholder="Describe your dark arts..."
                                        />
                                    </motion.div>
                                )}
                                {signupData.role === 'admin' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <input
                                            type="password" name="secretKey" value={signupData.secretKey} onChange={handleSignupChange} required
                                            className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:border-purple-500 outline-none"
                                            placeholder="Secret Key"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit" disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] mt-2"
                            >
                                {loading ? 'Registering...' : 'Sign Up'}
                            </button>
                        </form>

                        <div className="mt-4 text-center">
                            <button onClick={() => setIsFlipped(false)} className="text-purple-400 hover:text-purple-300 font-semibold text-sm">
                                ← Back to Login
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                /* Custom scrollbar for backend face if content overflows */
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #6b21a8; border-radius: 4px; }
            `}</style>
        </div>
    );
};

export default AuthPage;
