import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

const ImageModal = ({ isOpen, image, onClose }) => {
    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="relative w-full h-full flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={image}
                    alt="Evidence Large"
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/20"
                />
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </motion.div>
        </div>,
        document.body
    );
};

export default ImageModal;
