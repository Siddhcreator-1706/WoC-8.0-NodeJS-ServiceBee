import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-night border-t border-white/10 pt-16 pb-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blood to-transparent opacity-50"></div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 group">
                            <span className="text-3xl font-creepster text-pumpkin group-hover:text-blood transition-colors">Phantom Agency</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Connecting souls with the best services in the afterlife.
                            Trusted by mortals and spirits alike since 1888.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold mb-6 font-creepster tracking-wider text-xl">Quick Links</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li><Link to="/services" className="hover:text-pumpkin transition-colors text-sm">Find Services</Link></li>
                            <li><Link to="/login" className="hover:text-pumpkin transition-colors text-sm">Provider Login</Link></li>
                            <li><Link to="/signup" className="hover:text-pumpkin transition-colors text-sm">Become a Partner</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-bold mb-6 font-creepster tracking-wider text-xl">Support</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li><Link to="/help" className="hover:text-pumpkin transition-colors text-sm">Help Center</Link></li>
                            <li><Link to="/terms" className="hover:text-pumpkin transition-colors text-sm">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="hover:text-pumpkin transition-colors text-sm">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-bold mb-6 font-creepster tracking-wider text-xl">Contact</h3>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="text-blood">✉</span>
                                <span>spirits@phantom.agency</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-blood">☏</span>
                                <span>666-999-0000</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-blood">⚰</span>
                                <span>13 Elm Street, Crypt 404</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Phantom Agency. All souls reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-pumpkin transition-colors">Twitter</a>
                        <a href="#" className="hover:text-pumpkin transition-colors">Instagram</a>
                        <a href="#" className="hover:text-pumpkin transition-colors">LinkedIn</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
