import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-night border-t border-white/10 pt-10 pb-6 md:pt-16 md:pb-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blood to-transparent opacity-50"></div>

            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12 text-center md:text-left">
                    {/* Brand */}
                    <div className="space-y-3 md:space-y-4 flex flex-col items-center md:items-start">
                        <Link to="/" className="flex items-center gap-2 group">
                            <span className="text-2xl md:text-3xl font-creepster text-pumpkin group-hover:text-blood transition-colors">Phantom Agency</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs md:max-w-none mx-auto md:mx-0">
                            Connecting souls with the best services in the afterlife.
                            Trusted by mortals and spirits alike since 1888.
                        </p>
                    </div>

                    {/* Quick Links & Legal */}
                    <div className='flex flex-col items-start text-left'>
                        <h3 className="text-white font-bold mb-3 md:mb-6 font-creepster tracking-wider text-base md:text-xl text-left">Quick Links</h3>
                        <ul className="space-y-3 text-gray-400 w-full">
                            <ul className="space-y-3 text-gray-400 w-full">
                            <li><Link to="/login" className="hover:text-pumpkin transition-colors text-sm block py-1">Become Provider</Link></li>
                            <li><Link to="/services" className="hover:text-pumpkin transition-colors text-sm block py-1">Use Services</Link></li>
                            <li><Link to="/terms" className="hover:text-pumpkin transition-colors text-sm block py-1">Terms & Conditions</Link></li>
                        </ul>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className='flex flex-col items-start'>
                        <h3 className="text-white font-bold mb-3 md:mb-6 font-creepster tracking-wider text-base md:text-xl ">Contact</h3>
                        <ul className="space-y-3 text-gray-400 text-sm w-full">
                            <li className="flex items-center justify-start gap-2">
                                <span className="text-blood">✉</span>
                                <span>shahsiddhb@gmail.com</span>
                            </li>
                            <li className="flex items-center justify-start gap-2">
                                <span className="text-blood">☏</span>
                                <span>9586629207</span>
                            </li>
                            <li className="flex items-center justify-start gap-2">
                                <span className="text-blood">⚰</span>
                                <span>DAIICT, Gandhinagar</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/5 pt-6 md:pt-8 flex flex-col md:flex-row justify-center items-center text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Phantom Agency. All souls reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
