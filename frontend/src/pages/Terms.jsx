import { Link } from 'react-router-dom';

const Terms = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-gray-300 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-900/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto p-8 md:py-16">
                <div className="text-center mb-12">
                    <Link to="/" className="inline-block mb-6 group">
                        <img src="/logo.png" alt="Phantom Agency" className="w-16 h-16 mx-auto drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform duration-300" />
                    </Link>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-wider" style={{ fontFamily: 'Creepster, cursive' }}>
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                            Terms & Conditions
                        </span>
                    </h1>
                    <p className="text-gray-400 uppercase tracking-[0.2em] text-sm">The Phantom Agency Protocol</p>
                </div>

                <div className="space-y-8 bg-black/40 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl">
                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-3">
                            <span className="text-purple-500 opacity-50">01.</span> Introduction
                        </h2>
                        <p className="leading-relaxed text-gray-400">
                            Welcome to Phantom Agency (formerly ServiceBee). By accessing our ethereal network and utilizing our premium service connections, you acknowledge and agree to be bound by these Terms and Conditions. Proceed with intent.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-3">
                            <span className="text-purple-500 opacity-50">02.</span> Use of Service
                        </h2>
                        <p className="leading-relaxed text-gray-400">
                            You agree to use our platform strictly for lawful purposes. Our Service Providers are independent entities—shadows in the night—and not employees of Phantom Agency. We facilitate the connection; the mission is yours.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-3">
                            <span className="text-purple-500 opacity-50">03.</span> User Accounts
                        </h2>
                        <p className="leading-relaxed text-gray-400">
                            Guard your credentials as you would your life. You are solely responsible for maintaining the confidentiality of your account. Notify command immediately of any unauthorized breach or compromised transmissions.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-3">
                            <span className="text-purple-500 opacity-50">04.</span> Provider Obligations
                        </h2>
                        <p className="leading-relaxed text-gray-400">
                            Providers must execute services with precision and professionalism. We reserve the absolute right to disavow and remove any provider who violates our code of conduct or fails to deliver the expected caliber of service.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-3">
                            <span className="text-purple-500 opacity-50">05.</span> Limitation of Liability
                        </h2>
                        <p className="leading-relaxed text-gray-400">
                            Phantom Agency is a connector, a bridge. We are not liable for the outcome of missions (services) provided or any disputes arising between agents (users) and operatives (providers). Proceed at your own risk.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-3">
                            <span className="text-purple-500 opacity-50">06.</span> Contact Command
                        </h2>
                        <p className="leading-relaxed text-gray-400">
                            If you have inquiries regarding these protocols, establish contact at <a href="mailto:support@phantomagency.com" className="text-purple-400 hover:text-purple-300 transition-colors">support@phantomagency.com</a>.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-white/5 text-center">
                        <p className="text-sm text-gray-600 font-mono">
                            Last Protocol Update: <span className="text-gray-400">{new Date().toLocaleDateString()}</span>
                        </p>
                        <p className="mt-4 text-xs text-gray-700">
                            Phantom Agency © {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;
