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
                        <img
                            src="/logo.png"
                            alt="Phantom Agency"
                            className="w-16 h-16 mx-auto drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform duration-300"
                        />
                    </Link>
                    <h1
                        className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-wider"
                        style={{ fontFamily: 'Creepster, cursive' }}
                    >
                        <span className="bg-gradient-to-r from-purple-500 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,102,0,0.5)]">
                            Terms & Conditions
                        </span>
                    </h1>
                    <p className="text-gray-400 uppercase tracking-[0.2em] text-sm">
                        Phantom Agency
                    </p>
                </div>

                <div className="space-y-8 bg-black/40 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl">
                    {/* Introduction */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-orange-400">
                            Introduction
                        </h2>
                        <p className="leading-relaxed text-gray-400">
                            Welcome to Phantom Agency (formerly ServiceBee). By accessing or
                            using this platform, you agree to be legally bound by these
                            Terms and Conditions. If you do not agree, you must discontinue
                            use of the platform immediately.
                        </p>
                    </section>

                    {/* Use of Service */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-orange-400">
                            Use of the Platform
                        </h2>
                        <p className="leading-relaxed text-gray-400">
                            Phantom Agency provides a marketplace that connects users with
                            independent third-party service providers. We do not provide
                            services directly.
                        </p>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>Use the platform only for lawful purposes</li>
                            <li>Do not misuse, disrupt, or interfere with platform functionality</li>
                            <li>Do not submit false, misleading, or fraudulent information</li>
                        </ul>
                    </section>

                    {/* User Accounts */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-orange-400">
                            User Accounts
                        </h2>
                        <p className="leading-relaxed text-gray-400">
                            You are responsible for maintaining the confidentiality of
                            your account credentials and all activity that occurs under
                            your account.
                        </p>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>You are solely responsible for activity on your account</li>
                            <li>You must notify us immediately of unauthorized access</li>
                            <li>Accounts may be suspended or terminated for violations</li>
                        </ul>
                    </section>

                    {/* Service Providers */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-orange-400">
                            Service Providers
                        </h2>
                        <p className="leading-relaxed text-gray-400">
                            All service providers listed on Phantom Agency operate as
                            independent contractors and are not employees or agents of
                            Phantom Agency.
                        </p>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>Providers are responsible for their own services</li>
                            <li>Phantom Agency does not guarantee service quality or results</li>
                            <li>Providers may be removed for policy violations</li>
                        </ul>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-orange-400">
                            Limitation of Liability
                        </h2>
                        <p className="leading-relaxed text-gray-400">
                            Phantom Agency is not responsible for disputes, damages, or
                            losses arising from interactions between users and service
                            providers.
                        </p>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>All services are used at your own risk</li>
                            <li>No warranties are provided for third-party services</li>
                            <li>Liability is limited to the extent permitted by law</li>
                        </ul>
                    </section>

                    {/* Contact */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-orange-400">
                            Contact Information
                        </h2>
                        <p className="leading-relaxed text-gray-400">
                            If you have any questions regarding these Terms and Conditions,
                            please contact us at{" "}
                            <a
                                href="mailto:shahsiddhb@gmail.com"
                                className="text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                shahsiddhb@gmail.com
                            </a>.
                        </p>
                    </section>

                    {/* Footer */}
                    <div className="pt-8 border-t border-white/5 text-center">
                        <p className="text-sm text-gray-600 font-mono">
                            Last Updated:{" "}
                            <span className="text-gray-400">
                                {new Date().toLocaleDateString()}
                            </span>
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