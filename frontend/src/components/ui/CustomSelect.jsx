import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CustomSelect = ({
    label,
    name,
    value,
    onChange,
    options,
    placeholder = "Select...",
    disabled = false,
    loading = false,
    icon = null,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    // Update position on open and scroll/resize
    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + 8, // 8px spacing
                left: rect.left,
                width: rect.width
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('resize', updatePosition);

            const handleScroll = (event) => {
                // If scrolling inside the menu, do nothing
                if (menuRef.current && menuRef.current.contains(event.target)) {
                    return;
                }
                setIsOpen(false);
            };

            window.addEventListener('scroll', handleScroll, true);

            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', handleScroll, true);
            };
        }
    }, [isOpen]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (triggerRef.current && !triggerRef.current.contains(event.target) &&
                menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        if (onChange) {
            onChange({ target: { name, value: optionValue } });
        }
        setIsOpen(false);
    };

    // Find label for current value
    const selectedLabel = options.find(opt => opt.value === value)?.label || value || placeholder;
    const isPlaceholder = !value;

    return (
        <div className={`space-y-1.5 relative ${className}`}>
            {label && (
                <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">
                    {label}
                </label>
            )}

            <div
                ref={triggerRef}
                onClick={() => { if (!disabled && !loading) setIsOpen(!isOpen); }}
                className={`
                    w-full bg-[#0a0a0f]/60 border text-sm rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all duration-200
                    ${isOpen
                        ? 'border-violet-500 ring-1 ring-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                        : 'border-zinc-800 hover:border-violet-500/50 hover:bg-[#0a0a0f]/80'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {icon && <span className="text-violet-400">{icon}</span>}
                    <span className={`truncate ${isPlaceholder ? 'text-zinc-500' : 'text-white'}`}>
                        {loading ? 'Loading...' : selectedLabel}
                    </span>
                </div>

                <div className="text-zinc-500 pointer-events-none">
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <svg
                            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-violet-500' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Portal Dropdown Overlay */}
            {isOpen && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="fixed z-[9999] bg-[#12121a]/95 backdrop-blur-xl border border-violet-500/20 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] overflow-y-auto custom-scrollbar flex flex-col"
                            style={{
                                top: menuPosition.top,
                                left: menuPosition.left,
                                width: menuPosition.width, // Ensure consistent width
                                maxHeight: '200px',
                            }}
                            data-lenis-prevent
                        >
                            <div className="p-1.5 space-y-0.5">
                                {options.length > 0 ? (
                                    options.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSelect(option.value)}
                                            className={`
                                                w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group
                                                ${value === option.value
                                                    ? 'bg-violet-500/20 text-violet-200 font-medium'
                                                    : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                                                }
                                            `}
                                        >
                                            <span className="truncate">{option.label}</span>
                                            {value === option.value && (
                                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-violet-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </motion.span>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-8 text-center text-zinc-500 text-xs italic">
                                        No phantom options found... 👻
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default CustomSelect;
