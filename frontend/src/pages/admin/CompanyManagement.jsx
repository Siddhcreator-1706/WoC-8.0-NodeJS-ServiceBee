import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';


const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await axios.get('/api/companies');
                setCompanies(res.data.companies || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching companies:', error);
                setMessage({ text: 'Failed to fetch companies', type: 'error' });
                setLoading(false);
            }
        };
        fetchCompanies();
    }, [refreshKey]);

    const refreshData = () => setRefreshKey(prev => prev + 1);

    const handleVerify = async (id, name) => {
        if (!confirm(`Are you sure you want to verify ${name}?`)) return;

        try {
            await axios.put(`/api/companies/${id}/verify`, {}, { withCredentials: true });
            setMessage({ text: 'Company verified successfully', type: 'success' });
            refreshData();
        } catch (error) {
            console.error('Failed to verify:', error);
            setMessage({ text: error.response?.data?.message || 'Verification failed', type: 'error' });
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`WARNING: Deleting company ${name} will also PERMANENTLY DELETE all its services. This cannot be undone. Proceed?`)) return;

        try {
            await axios.delete(`/api/companies/${id}`, { withCredentials: true });
            setMessage({ text: 'Company and associated services deleted', type: 'success' });
            refreshData();
        } catch (error) {
            console.error('Failed to delete:', error);
            setMessage({ text: error.response?.data?.message || 'Deletion failed', type: 'error' });
        }
    };

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(search.toLowerCase()) ||
        company.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl text-white font-bold font-creepster tracking-wider">Manage Companies</h2>
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#15151e] text-gray-200 px-4 py-2.5 rounded-xl pl-10 border border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder-gray-500 shadow-md"
                    />
                    <svg className="w-5 h-5 text-gray-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 mb-6 rounded-xl border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-[#15151e]/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800 shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#0a0a0f]/80 border-b border-gray-700">
                                <tr className="text-left text-gray-400 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-medium">Company</th>
                                    <th className="p-4 font-medium">Owner</th>
                                    <th className="p-4 font-medium text-center">Services</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredCompanies.map(company => (
                                    <tr key={company._id} className="text-gray-300 hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600 group-hover:border-orange-500/50 transition-colors">
                                                    {company.logo ? <img src={company.logo} alt="" className="w-full h-full object-cover" /> : <span className="text-xl">🏢</span>}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{company.name}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{company.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">{company.owner?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500 font-mono">{company.owner?.email}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full text-xs font-bold border border-gray-700">
                                                {company.serviceCount || 0}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border
                                                ${company.isVerified ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                {company.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {!company.isVerified && (
                                                    <button
                                                        onClick={() => handleVerify(company._id, company.name)}
                                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-green-500/20"
                                                    >
                                                        Verify
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(company._id, company.name)}
                                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete Company"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredCompanies.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <span className="text-4xl mb-2">🔍</span>
                            <p>No companies found matching "{search}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CompanyManagement;
