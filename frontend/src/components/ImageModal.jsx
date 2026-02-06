import { motion, AnimatePresence } from 'framer-motion';

const ImageModal = ({ isOpen, image, onClose }) => {
    if (!isOpen || !image) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/95 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative max-w-full max-h-full z-10 flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button for mobile/desktop - consistent location */}
                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 md:-right-12 text-white/70 hover:text-white transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/10"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <img
                            src={image}
                            alt="Full size"
                            className="max-w-full max-h-[85vh] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 object-contain bg-black/50"
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ImageModal;
