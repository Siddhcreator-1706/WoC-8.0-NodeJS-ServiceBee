import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const { user, logout } = useAuth();
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const ctaRef = useRef(null);

    useEffect(() => {
        // Hero animation
        gsap.fromTo(heroRef.current.querySelectorAll('.hero-anim'),
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }
        );

        // Features scroll animation
        gsap.fromTo(featuresRef.current.querySelectorAll('.feature-card'),
            { opacity: 0, y: 60, scale: 0.9 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: 0.6,
                stagger: 0.15,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                    trigger: featuresRef.current,
                    start: 'top 80%',
                }
            }
        );

        // CTA animation
        gsap.fromTo(ctaRef.current,
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1, scale: 1,
                duration: 0.8,
                ease: 'elastic.out(1, 0.5)',
                scrollTrigger: {
                    trigger: ctaRef.current,
                    start: 'top 85%',
                }
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-x-hidden">
            {/* Navbar */}
            <nav className="px-6 py-4 flex justify-between items-center border-b border-purple-500/20 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-50">
                <Link to="/">
                    <h1 className="text-2xl font-bold text-orange-400" style={{ fontFamily: 'Creepster, cursive' }}>
                        🎃 ServiceBee
                    </h1>
                </Link>
                <div className="flex gap-4 items-center">
                    <Link to="/services" className="text-gray-300 hover:text-orange-400 transition-colors">Services</Link>
                    {user ? (
                        <>
                            <Link to="/profile" className="text-gray-300 hover:text-orange-400">Profile</Link>
                            <Link to="/favorites" className="text-gray-300 hover:text-orange-400">Favorites</Link>
                            {(user.role === 'admin' || user.role === 'superuser') && (
                                <Link to="/admin" className="text-purple-400 hover:text-purple-300">Admin</Link>
                            )}
                            <button onClick={logout} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-orange-400 hover:text-orange-300">Login</Link>
                            <Link to="/signup" className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} className="px-6 py-24 text-center relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-1/4 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <h2 className="hero-anim text-5xl md:text-7xl font-bold text-white mb-6" style={{ fontFamily: 'Creepster, cursive' }}>
                    Welcome to <span className="text-orange-400 glow-text">ServiceBee</span>
                </h2>
                <p className="hero-anim text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                    Discover spooktacular services tailored just for you. Browse, rate, and bookmark your favorites!
                </p>
                <div className="hero-anim flex gap-4 justify-center flex-wrap">
                    <Link to="/services" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all text-lg">
                        Explore Services 👻
                    </Link>
                    {!user && (
                        <Link to="/signup" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all text-lg">
                            Join Now 🎃
                        </Link>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section ref={featuresRef} className="px-6 py-20 bg-gray-900/50">
                <h3 className="text-3xl font-bold text-center text-white mb-12" style={{ fontFamily: 'Creepster, cursive' }}>
                    Why Choose <span className="text-orange-400">ServiceBee</span>?
                </h3>
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    {[
                        { icon: '🔍', title: 'Smart Filters', desc: 'Find services by location, rating, price, and category' },
                        { icon: '⭐', title: 'Rate & Review', desc: 'Share your experience and help others choose' },
                        { icon: '🔖', title: 'Bookmarks', desc: 'Save your favorite services for later' },
                        { icon: '📢', title: 'Complaints', desc: 'Submit and track complaints easily' },
                        { icon: '👤', title: 'Profile', desc: 'Manage your account and preferences' },
                        { icon: '🛡️', title: 'Secure', desc: 'Cookie-based authentication for safety' }
                    ].map((feature, i) => (
                        <div key={i} className="feature-card p-6 bg-gray-800/50 border border-purple-500/20 rounded-xl text-center hover:border-orange-400/50 transition-colors">
                            <span className="text-5xl mb-4 block">{feature.icon}</span>
                            <h4 className="text-xl font-bold text-orange-400 mb-2">{feature.title}</h4>
                            <p className="text-gray-400">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section ref={ctaRef} className="px-6 py-20 text-center">
                <div className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-purple-800/30 to-orange-500/20 rounded-2xl border border-purple-500/30">
                    <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Creepster, cursive' }}>
                        Ready to Get Started?
                    </h3>
                    <p className="text-gray-300 mb-6">Browse our services or create an account to unlock all features!</p>
                    <Link to="/services" className="inline-block px-8 py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
                        View All Services
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-purple-500/20 text-center text-gray-400">
                <p>© 2024 ServiceBee. All rights reserved. 🎃</p>
            </footer>
        </div>
    );
};

export default Home;
