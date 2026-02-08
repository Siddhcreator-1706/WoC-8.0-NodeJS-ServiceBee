import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageUpload from '../ImageUpload';
import API_URL from '../../config/api';

const ProviderProfile = ({ company, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [logo, setLogo] = useState([]);

    const [companyForm, setCompanyForm] = useState({
        name: '', description: '', email: '', phone: '', website: '',
        address: { street: '', city: '', state: '', zipCode: '' }
    });

    useEffect(() => {
        if (company) {
            setCompanyForm({
                name: company.name,
                description: company.description,
                email: company.email,
                phone: company.phone,
                website: company.website || '',
                address: company.address || { street: '', city: '', state: '', zipCode: '' }
            });
            if (company.logo) {
                setLogo([{ preview: company.logo }]);
            }
        }
    }, [company]);

    // Cleanup messages
    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => { setMessage(''); setError(''); }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, error]);

    const handleCompanySubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', companyForm.name);
            formData.append('description', companyForm.description);
            formData.append('email', companyForm.email);
            formData.append('phone', companyForm.phone);
            formData.append('website', companyForm.website);
            formData.append('address', JSON.stringify(companyForm.address));

            if (logo.length > 0) {
                const file = logo[0];
                if (file instanceof File) {
                    formData.append('logo', file);
                }
            }

            const url = `${API_URL}/api/companies/${company._id}`;
            const res = await fetch(url, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setMessage('Company updated!');
                setIsEditing(false);
                if (onUpdate) onUpdate();
            } else {
                const data = await res.json();
                setError(data.message || 'Update failed');
            }
        } catch (err) {
            setError('Something went wrong');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!company) return null;

    // Derived stats for display
    const services = company.services || [];
    // We don't have bookings/complaints count here unless passed as props. 
    // To keep it simple, we might omit them or pass them. 
    // Let's pass them as props if needed, or just remove for now and focus on profile details.
    // The original code calculated stats from props or state.
    // Let's accept stats as props.

    return (
        <div className="max-w-4xl mx-auto">
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 backdrop-blur-md text-center">
                    ⚠️ {error}
                </div>
            )}
            {message && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl mb-6 backdrop-blur-md text-center">
                    ✨ {message}
                </div>
            )}

            <div className="bg-night/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden mb-8 shadow-xl relative group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-pumpkin/5 to-blood/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold text-pumpkin font-creepster tracking-wider">Company Details</h2>
                    <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${isEditing
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                            : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg shadow-orange-900/20'}`}
                    >
                        {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
                </div>

                <form onSubmit={handleCompanySubmit} className="p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left: Logo */}
                        <div className="flex-shrink-0 md:w-1/3 flex flex-col items-center">
                            {isEditing ? (
                                <div className="w-full">
                                    <ImageUpload
                                        label="Update Logo"
                                        maxImages={1}
                                        existingImages={logo}
                                        onImagesChange={setLogo}
                                    />
                                </div>
                            ) : (
                                <div className="w-40 h-40 rounded-full border-4 border-[#252530] overflow-hidden bg-[#0a0a0f] shadow-lg shadow-orange-900/20">
                                    {logo[0]?.preview ? (
                                        <img src={logo[0].preview} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">No Logo</div>
                                    )}
                                </div>
                            )}

                            {!isEditing && (
                                <div className="mt-6 w-full grid grid-cols-1 gap-4">
                                    <div className="bg-[#0a0a0f]/50 p-3 rounded-xl text-center border border-gray-800">
                                        <div className="text-2xl font-bold text-white">{services.length}</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider">Services</div>
                                    </div>
                                    {/* Removed Booking/Ratings stats to avoid prop drilling complexity for now. Can be re-added later. */}
                                </div>
                            )}
                        </div>

                        {/* Right: Details */}
                        <div className="flex-grow md:w-2/3 space-y-6">
                            {isEditing ? (
                                // Edit Mode Form
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                                        <input type="text" value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Description</label>
                                        <textarea value={companyForm.description} onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 text-white h-32"></textarea>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Email (Read-Only)</label>
                                            <input type="email" value={companyForm.email} disabled className="w-full bg-[#0a0a0f]/50 text-gray-500 border border-gray-800 rounded-lg p-3 cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Phone</label>
                                            <input type="text" value={companyForm.phone} onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Website</label>
                                        <input type="text" value={companyForm.website} onChange={e => setCompanyForm({ ...companyForm, website: e.target.value })} className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 text-white" />
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button type="submit" disabled={submitting} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center gap-2">
                                            {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </>
                            ) : (
                                // Read-Only View
                                <div className="space-y-6">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white mb-2">{companyForm.name}</h1>
                                        {companyForm.description && <p className="text-gray-400 leading-relaxed">{companyForm.description}</p>}
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-gray-700/50">
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <span className="w-6 flex justify-center text-orange-400">✉️</span>
                                            <span>{companyForm.email}</span>
                                        </div>
                                        {companyForm.phone && (
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <span className="w-6 flex justify-center text-orange-400">📞</span>
                                                <span>{companyForm.phone}</span>
                                            </div>
                                        )}
                                        {companyForm.website && (
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <span className="w-6 flex justify-center text-orange-400">🌐</span>
                                                <a href={companyForm.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{companyForm.website}</a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 mt-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${company.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                                            {company.isActive ? 'Account Active' : 'Account Inactive'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProviderProfile;
