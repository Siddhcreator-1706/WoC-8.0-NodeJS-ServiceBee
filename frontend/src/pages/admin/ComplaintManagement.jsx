import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_URL from '../../config/api';
import CustomSelect from '../../components/ui/CustomSelect';

const ComplaintManagement = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [message, setMessage] = useState(null); // Added message state

    const [refreshKey, setRefreshKey] = useState(0);



    const handleResolve = (id) => {
        const response = prompt('Enter resolution details:');
        if (response) handleUpdateStatus(id, 'resolved', response);
    };

    const handleReject = (id) => {
        const response = prompt('Enter reason for rejection:');
        if (response) handleUpdateStatus(id, 'rejected', response);
    };

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                // The instruction's query logic uses 'all', but CustomSelect uses ''.
                // I'll adapt the instruction's logic to match the existing CustomSelect's '' for 'All Status'.
                const query = filter ? `?status=${filter}` : '';
                const res = await axios.get(`${API_URL}/api/complaints${query}`, { withCredentials: true }); // Added withCredentials for axios
                setComplaints(res.data.complaints || []); // Assuming API returns { complaints: [...] }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching complaints:', error);
                setMessage({ text: 'Failed to fetch complaints', type: 'error' });
                setLoading(false);
            }
        };
        fetchComplaints();
    }, [filter, refreshKey]);

    const refreshData = () => setRefreshKey(prev => prev + 1);

    const handleUpdateStatus = async (id, newStatus, adminResponse = '') => { // Renamed and added adminResponse
        try {
            await axios.put(`${API_URL}/api/complaints/${id}`, { status: newStatus, adminResponse }, { withCredentials: true }); // Added adminResponse and withCredentials
            setMessage({ text: `Complaint marked as ${newStatus}`, type: 'success' });
            refreshData();
        } catch (error) {
            console.error('Update failed:', error);
            setMessage({ text: 'Failed to update status', type: 'error' });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/15';
            case 'in-progress': return 'text-blue-400 bg-blue-400/10 border-blue-400/15';
            case 'resolved': return 'text-green-400 bg-green-400/10 border-green-400/15';
            case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/15';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/15';
        }
    };

    return (
        <div>
            {/* Header + Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 font-bold font-creepster tracking-wider">
                        👻 Manage Complaints
                    </h2>
                    <p className="text-gray-500 text-xs mt-1">{complaints.length} complaints found</p>
                </div>
                <div className="w-40 sm:w-48">
                    <CustomSelect
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        options={[
                            { value: '', label: 'All Status' }, // Value should be '' to match state init if logic implies empty string for all. Wait, line 61 says 'all'. Let me check fetch logic.
                            { value: 'pending', label: 'Pending' },
                            { value: 'in-progress', label: 'In Progress' },
                            { value: 'resolved', label: 'Resolved' },
                            { value: 'rejected', label: 'Rejected' },
                        ]}
                        icon={<span className="text-lg">📊</span>}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : complaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-[#0d0d14]/50 rounded-2xl border border-dashed border-orange-900/20">
                    <span className="text-5xl mb-3 opacity-30">👻</span>
                    <h3 className="text-lg font-bold text-gray-400 mb-1">All Quiet on the Front</h3>
                    <p className="text-gray-600 text-sm">No complaints found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {complaints.map((complaint, index) => (
                        <motion.div
                            key={complaint._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="bg-[#0d0d14]/70 backdrop-blur-sm p-5 rounded-2xl border border-orange-900/15 hover:border-orange-500/20 transition-all shadow-md group"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3 className="font-bold text-white text-sm group-hover:text-orange-300 transition-colors">{complaint.subject}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] capitalize font-semibold border ${getStatusColor(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 flex items-center gap-1.5 flex-wrap">
                                        <span className="text-gray-600">From:</span> {complaint.user?.name || 'Unknown'}
                                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                                        <span className="text-gray-600">Re:</span> {complaint.service?.name || 'Unknown Service'}
                                    </p>
                                </div>
                                <div className="text-[10px] text-gray-600 font-mono shrink-0">
                                    {new Date(complaint.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="bg-[#0a0a0f]/60 p-3.5 rounded-xl border border-gray-800/40 mb-3">
                                <p className="text-gray-300 leading-relaxed text-sm">{complaint.message}</p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800/30">
                                {complaint.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus(complaint._id, 'in-progress')}
                                            className="px-3.5 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/15 rounded-xl text-xs font-medium transition-colors"
                                        >
                                            Mark In Progress
                                        </button>
                                        <button
                                            onClick={() => handleReject(complaint._id)}
                                            className="px-3.5 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/15 rounded-xl text-xs font-medium transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {complaint.status === 'in-progress' && (
                                    <button
                                        onClick={() => handleResolve(complaint._id)}
                                        className="px-3.5 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/15 rounded-xl text-xs font-medium transition-colors"
                                    >
                                        Mark Resolved
                                    </button>
                                )}
                                {['resolved', 'rejected'].includes(complaint.status) && (
                                    <span className="text-gray-600 text-xs italic">
                                        {complaint.adminResponse ? 'Response sent' : 'No response sent'}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ComplaintManagement;
