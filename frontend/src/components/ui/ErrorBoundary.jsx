import React from 'react';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-[#0a0a0f] border border-red-900/20 rounded-2xl p-8 text-center shadow-2xl shadow-red-900/10 backdrop-blur-sm relative overflow-hidden">

                        {/* Background Elements */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="text-6xl mb-4 animate-bounce">⚰️</div>
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 font-creepster tracking-wider mb-2 drop-shadow-sm">
                                Fatal Error
                            </h1>
                            <p className="text-gray-400 text-sm mb-6">
                                The spirits have disturbed the interface. <br />
                                <span className="text-xs text-red-400/80 font-mono mt-3 block bg-black/40 p-3 rounded border border-red-900/30 break-all select-all">
                                    {this.state.error?.toString() || "Unknown Error"}
                                </span>
                            </p>

                            <div className="flex gap-3 justify-center pt-2">
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all text-sm font-medium border border-gray-700 w-full"
                                >
                                    Go Home
                                </button>
                                <button
                                    onClick={this.handleReset}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500 shadow-lg shadow-red-900/20 transition-all text-sm font-medium w-full"
                                >
                                    Resurrect
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
