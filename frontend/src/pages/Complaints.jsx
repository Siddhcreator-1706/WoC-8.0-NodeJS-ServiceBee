import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Complaints = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ serviceId: '', subject: '', message: '' });
    const [images, setImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchComplaints();
        fetchServices();
    }, [user, navigate]);

    const fetchComplaints = async () => {
        try {
            const res = await fetch(`${API_URL}/api/complaints/me`, { credentials: 'include' });
            const data = await res.json();
            setComplaints(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const res = await fetch(`${API_URL}/api/services`);
            const data = await res.json();
            setServices(data.services || []);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const formPayload = new FormData();
            formPayload.append('serviceId', formData.serviceId);
            formPayload.append('subject', formData.subject);
            formPayload.append('message', formData.message);
            images.forEach(img => formPayload.append('images', img));

            const res = await fetch(`${API_URL}/api/complaints`, {
                method: 'POST',
                credentials: 'include',
                body: formPayload
            });

            const data = await res.json();
            if (res.ok) {
                setFormData({ serviceId: '', subject: '', message: '' });
                setImages([]);
                setShowForm(false);
                fetchComplaints();
            } else {
                setError(data.message || 'Failed to submit');
            }
        } catch (error) {
            setError('Failed to submit complaint');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-400 bg-yellow-400/20';
            case 'in-progress': return 'text-blue-400 bg-blue-400/20';
            case 'resolved': return 'text-green-400 bg-green-400/20';
            case 'rejected': return 'text-red-400 bg-red-400/20';
            case 'service-unavailable': return 'text-gray-400 bg-gray-400/20';
            default: return 'text-gray-400 bg-gray-400/20';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'service-unavailable': return 'Service Removed';
            default: return status;
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <nav className="px-6 py-4 flex justify-between items-center border-b border-purple-500/20">
                <Link to="/"><h1 className="text-2xl font-bold text-orange-400" style={{ fontFamily: 'Creepster, cursive' }}>🎃 ServiceBee</h1></Link>
                <Link to="/profile" className="text-gray-300 hover:text-orange-400">← Profile</Link>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Creepster, cursive' }}>
                        My <span className="text-orange-400">Complaints</span>
                    </h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        {showForm ? 'Cancel' : '+ New Complaint'}
                    </button>
                </div>

                {/* Complaint Form */}
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        onSubmit={handleSubmit}
                        className="bg-gray-800/50 p-6 rounded-xl border border-purple-500/20 mb-8"
                    >
                        {error && <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}
                        <div className="space-y-4">
                            <select
                                value={formData.serviceId}
                                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                                required
                                className="w-full p-3 bg-gray-700 rounded-lg text-white"
                            >
                                <option value="">Select Service</option>
                                {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Subject (min 5 characters)"
                                required
                                minLength={5}
                                maxLength={100}
                                className="w-full p-3 bg-gray-700 rounded-lg text-white"
                            />
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Describe your complaint in detail (min 20 characters)..."
                                required
                                minLength={20}
                                maxLength={1000}
                                className="w-full p-3 bg-gray-700 rounded-lg text-white h-32"
                            />

                            <ImageUpload
                                onImagesChange={setImages}
                                maxImages={3}
                                label="Attach Evidence (optional)"
                            />

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-orange-500 text-white rounded-lg disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Complaint'}
                            </button>
                        </div>
                    </motion.form>
                )}

                {/* Complaints List */}
                {loading ? (
                    <div className="text-center text-orange-400">Loading...</div>
                ) : complaints.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">No complaints yet.</div>
                ) : (
                    <div className="space-y-4">
                        {complaints.map((complaint) => (
                            <motion.div
                                key={complaint._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-800/50 p-6 rounded-xl border border-purple-500/20"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-white">{complaint.subject}</h3>
                                    <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(complaint.status)}`}>
                                        {getStatusLabel(complaint.status)}
                                    </span>
                                </div>
                                <p className="text-sm text-purple-400 mb-2">
                                    Service: {complaint.service?.name || complaint.serviceSnapshot?.name || 'N/A'}
                                </p>
                                <p className="text-gray-400 mb-3">{complaint.message}</p>

                                {/* Attached Images */}
                                {complaint.images && complaint.images.length > 0 && (
                                    <div className="flex gap-2 mb-3">
                                        {complaint.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img.url}
                                                alt={`Attachment ${idx + 1}`}
                                                onClick={() => setSelectedImage(img.url)}
                                                className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Service Provider Response */}
                                {complaint.serviceProviderResponse && (
                                    <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border-l-4 border-blue-400">
                                        <p className="text-sm text-blue-400 font-medium mb-1">🏪 Service Provider:</p>
                                        <p className="text-gray-300">{complaint.serviceProviderResponse}</p>
                                    </div>
                                )}

                                {/* Admin Response */}
                                {complaint.adminResponse && (
                                    <div className="mt-3 p-3 bg-green-500/10 rounded-lg border-l-4 border-green-400">
                                        <p className="text-sm text-green-400 font-medium mb-1">👤 Admin:</p>
                                        <p className="text-gray-300 whitespace-pre-wrap">{complaint.adminResponse}</p>
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 mt-3">
                                    {new Date(complaint.createdAt).toLocaleDateString()}
                                    {complaint.resolvedAt && ` · Resolved: ${new Date(complaint.resolvedAt).toLocaleDateString()}`}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Image Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <img src={selectedImage} alt="Full size" className="max-w-[90vw] max-h-[90vh] object-contain" />
                    <button className="absolute top-4 right-4 text-white text-2xl">&times;</button>
                </div>
            )}
        </div>
    );
};

export default Complaints;
