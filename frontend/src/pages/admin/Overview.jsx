import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import API_URL from '../../config/api';

const Overview = () => {
    const [stats, setStats] = useState({
        revenue: { total: 0 },
        users: { total: 0, change: '+0%' },
        services: { total: 0 },
        complaints: { pending: 0 },
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    const handleSystemDiagnostics = async () => {
        const toastId = toast.loading('Running system checks...');
        try {
            // Ping stats endpoint as a health check
            await axios.get(`${API_URL}/api/admin/stats`, { withCredentials: true });
            setTimeout(() => {
                toast.success('System Operational: All systems nominal', {
                    id: toastId,
                    style: { background: '#1a1a24', color: '#4ade80', border: '1px solid #22c55e' }
                });
            }, 1000); // Fake delay for dramatic effect
        } catch (error) {
            toast.error('System Check Failed: Backend unreachable', { id: toastId });
        }
    };

    const handleExportUsers = async () => {
        const toastId = toast.loading('Exporting user data...');
        try {
            const res = await axios.get(`${API_URL}/api/users`, { withCredentials: true });
            const users = res.data;

            if (!users || users.length === 0) {
                toast.error('No users to export', { id: toastId });
                return;
            }

            // Convert to CSV
            const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Joined Date'];
            const csvContent = [
                headers.join(','),
                ...users.map(u => [
                    u._id,
                    `"${u.name}"`,
                    u.email,
                    u.role,
                    u.isActive ? 'Active' : 'Inactive',
                    new Date(u.createdAt).toISOString().split('T')[0]
                ].join(','))
            ].join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Exported ${users.length} users successfully`, {
                id: toastId,
                style: { background: '#1a1a24', color: '#60a5fa', border: '1px solid #3b82f6' }
            });
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export user data', { id: toastId });
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/admin/stats`, { withCredentials: true });
                if (res.data.success) {
                    setStats(prev => ({ ...prev, ...res.data.data }));
                }
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { title: 'Total Revenue', value: `₹${stats.revenue.total.toLocaleString()}`, sub: 'All time', icon: '💰', gradient: 'from-green-600/20 to-emerald-900/20', borderColor: 'border-green-500/20', textColor: 'text-green-400', glowColor: 'shadow-green-500/5' },
        { title: 'Total Users', value: stats.users.total, sub: 'Active accounts', icon: '🦇', gradient: 'from-blue-600/20 to-indigo-900/20', borderColor: 'border-blue-500/20', textColor: 'text-blue-400', glowColor: 'shadow-blue-500/5' },
        { title: 'Services Listed', value: stats.services.total, sub: 'Total services', icon: '🕯️', gradient: 'from-purple-600/20 to-violet-900/20', borderColor: 'border-purple-500/20', textColor: 'text-purple-400', glowColor: 'shadow-purple-500/5' },
        { title: 'Pending Complaints', value: stats.complaints.pending, sub: 'Needs attention', icon: '👻', gradient: 'from-orange-600/20 to-red-900/20', borderColor: 'border-orange-500/20', textColor: 'text-orange-400', glowColor: 'shadow-orange-500/5' }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-60">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8" data-lenis-prevent>
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold font-creepster text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 tracking-wider">
                    Dashboard Overview
                </h1>
                <p className="text-gray-500 text-sm mt-1">Welcome back to the Phantom Control Panel</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className={`bg-gradient-to-br ${stat.gradient} p-5 rounded-2xl border ${stat.borderColor} shadow-lg ${stat.glowColor} relative overflow-hidden group`}
                    >
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.title}</h3>
                            <span className="text-2xl opacity-70">{stat.icon}</span>
                        </div>
                        <div className={`text-3xl font-bold font-mono ${stat.textColor}`}>{stat.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{stat.sub}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-[#0d0d14]/80 backdrop-blur-sm border border-orange-900/15 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-orange-300 mb-5 font-creepster tracking-wide flex items-center gap-2">
                        <span>🕸️</span> Recent Activity
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-3 bg-[#0a0a0f]/60 rounded-xl border border-gray-800/50 hover:border-orange-500/20 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm
                                            ${activity.type === 'booking' ? 'bg-green-500/15 text-green-400' :
                                                activity.type === 'complaint' ? 'bg-orange-500/15 text-orange-400' :
                                                    activity.type === 'user_signup' ? 'bg-blue-500/15 text-blue-400' :
                                                        'bg-purple-500/15 text-purple-400'}`}>
                                            {activity.type === 'booking' ? '📅' :
                                                activity.type === 'complaint' ? '⚠️' :
                                                    activity.type === 'user_signup' ? '👤' : '🏢'}
                                        </div>
                                        <div>
                                            <p className="text-gray-200 text-sm font-medium">{activity.user} <span className="text-gray-500 font-normal text-xs">— {activity.action}</span></p>
                                            <p className="text-[11px] text-gray-600">{new Date(activity.time).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                                <span className="text-4xl mb-2 opacity-30">🕸️</span>
                                <p className="text-sm">No recent activity found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#0d0d14]/80 backdrop-blur-sm border border-orange-900/15 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-orange-300 mb-5 font-creepster tracking-wide flex items-center gap-2">
                        <span>⚡</span> Quick Actions
                    </h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => toast('📢 Broadcast feature coming soon!', { icon: '🚧', style: { background: '#1a1a24', color: '#fb923c' } })}
                            className="w-full text-left p-4 bg-purple-500/8 hover:bg-purple-500/15 text-purple-300 rounded-xl border border-purple-500/15 transition-all flex items-center justify-between group"
                        >
                            <span className="text-sm">📣 Broadcast Announcement</span>
                            <span className="text-purple-500 group-hover:translate-x-1 transition-transform text-xs">→</span>
                        </button>
                        <button
                            onClick={handleSystemDiagnostics}
                            className="w-full text-left p-4 bg-orange-500/8 hover:bg-orange-500/15 text-orange-300 rounded-xl border border-orange-500/15 transition-all flex items-center justify-between group"
                        >
                            <span className="text-sm">⚡ System Diagnostics</span>
                            <span className="text-orange-500 group-hover:translate-x-1 transition-transform text-xs">→</span>
                        </button>
                        <button
                            onClick={handleExportUsers}
                            className="w-full text-left p-4 bg-blue-500/8 hover:bg-blue-500/15 text-blue-300 rounded-xl border border-blue-500/15 transition-all flex items-center justify-between group"
                        >
                            <span className="text-sm">👥 Export User Data</span>
                            <span className="text-blue-500 group-hover:translate-x-1 transition-transform text-xs">→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
