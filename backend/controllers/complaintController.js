const Complaint = require('../models/Complaint');
const Service = require('../models/Service');
const { uploadComplaintImages, deleteImage } = require('../config/cloudinary');
const { sendComplaintStatusEmail } = require('../utils/emailService');

// Validation helper
const validateComplaintInput = (subject, message) => {
    const errors = [];
    if (!subject || subject.trim().length < 5) errors.push('Subject must be at least 5 characters');
    if (!message || message.trim().length < 20) errors.push('Message must be at least 20 characters');
    if (subject && subject.length > 100) errors.push('Subject cannot exceed 100 characters');
    if (message && message.length > 1000) errors.push('Message cannot exceed 1000 characters');
    return errors;
};

// @desc    Create a complaint (with optional images)
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res) => {
    try {
        // Run multer middleware (Promise-based for multer v2)
        await uploadComplaintImages(req, res);

        const { serviceId, subject, message } = req.body;

        const errors = validateComplaintInput(subject, message);
        if (errors.length > 0) {
            return res.status(400).json({ message: errors.join(', ') });
        }

        const service = await Service.findById(serviceId);
        if (!service || !service.isActive) {
            return res.status(404).json({ message: 'Service not found or inactive' });
        }

        // Check for duplicate pending complaint
        const existing = await Complaint.findOne({
            user: req.user._id,
            service: serviceId,
            status: 'pending'
        });
        if (existing) {
            return res.status(400).json({ message: 'You already have a pending complaint for this service' });
        }

        // Process uploaded images
        const images = req.files ? req.files.map(file => ({
            url: file.path,
            publicId: file.filename
        })) : [];

        const complaint = await Complaint.create({
            user: req.user._id,
            service: serviceId,
            subject: subject.trim(),
            message: message.trim(),
            images
        });

        res.status(201).json(complaint);
    } catch (error) {
        res.status(error.code === 'LIMIT_FILE_SIZE' ? 400 : 500).json({ message: error.message });
    }
};

// @desc    Get user's complaints
// @route   GET /api/complaints/me
// @access  Private
const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ user: req.user._id })
            .populate('service', 'name location image')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get complaints for service provider's services
// @route   GET /api/complaints/my-services
// @access  Private (admin/superuser)
const getServiceProviderComplaints = async (req, res) => {
    try {
        const myServices = await Service.find({ createdBy: req.user._id }).select('_id');
        const serviceIds = myServices.map(s => s._id);

        if (serviceIds.length === 0) return res.json([]);

        const complaints = await Complaint.find({
            service: { $in: serviceIds },
            status: { $in: ['pending', 'in-progress'] }
        })
            .populate('user', 'name email')
            .populate('service', 'name location')
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Service provider responds to complaint
// @route   PUT /api/complaints/:id/respond
// @access  Private (service owner)
const serviceProviderRespond = async (req, res) => {
    try {
        const { response } = req.body;

        if (!response || response.trim().length < 10) {
            return res.status(400).json({ message: 'Response must be at least 10 characters' });
        }

        const complaint = await Complaint.findById(req.params.id)
            .populate('user', 'name email')
            .populate('service', 'createdBy');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        if (complaint.service?.createdBy?.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        complaint.serviceProviderResponse = response.trim();
        complaint.serviceProviderRespondedAt = new Date();
        if (complaint.status === 'pending') complaint.status = 'in-progress';

        await complaint.save();

        if (complaint.user?.email) {
            await sendComplaintStatusEmail(complaint.user.email, complaint, complaint.status, complaint.user.name);
        }

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all complaints (admin)
// @route   GET /api/complaints
// @access  Private/Admin
const getAllComplaints = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = status ? { status } : {};
        const skip = (Number(page) - 1) * Number(limit);

        const [complaints, total] = await Promise.all([
            Complaint.find(filter)
                .populate('user', 'name email')
                .populate('service', 'name location image')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Complaint.countDocuments(filter)
        ]);

        res.json({ complaints, page: Number(page), pages: Math.ceil(total / Number(limit)), total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id
// @access  Private/Admin
const updateComplaintStatus = async (req, res) => {
    try {
        const { status, adminResponse } = req.body;

        if (!['pending', 'in-progress', 'resolved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const complaint = await Complaint.findById(req.params.id).populate('user', 'name email');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        const previousStatus = complaint.status;
        complaint.status = status;
        if (adminResponse) complaint.adminResponse = adminResponse.trim();

        if (status === 'resolved' || status === 'rejected') {
            complaint.resolvedBy = req.user._id;
            complaint.resolvedAt = new Date();
        }

        await complaint.save();

        if (previousStatus !== status && complaint.user?.email) {
            await sendComplaintStatusEmail(complaint.user.email, complaint, status, complaint.user.name);
        }

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private/Superuser
const deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        if (complaint.status === 'in-progress' && req.query.force !== 'true') {
            return res.status(400).json({ message: 'Cannot delete in-progress complaint. Add ?force=true' });
        }

        // Delete images from Cloudinary
        for (const img of complaint.images || []) {
            if (img.publicId) await deleteImage(img.publicId);
        }

        await complaint.deleteOne();
        res.json({ message: 'Complaint removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get complaint statistics
// @route   GET /api/complaints/stats
// @access  Private/Admin
const getComplaintStats = async (req, res) => {
    try {
        const stats = await Complaint.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const totalComplaints = await Complaint.countDocuments();
        const resolvedCount = stats.find(s => s._id === 'resolved')?.count || 0;
        const avgResolutionTime = await Complaint.aggregate([
            { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
            { $project: { resolutionTime: { $subtract: ['$resolvedAt', '$createdAt'] } } },
            { $group: { _id: null, avgTime: { $avg: '$resolutionTime' } } }
        ]);

        res.json({
            total: totalComplaints,
            byStatus: stats,
            resolutionRate: totalComplaints > 0 ? ((resolvedCount / totalComplaints) * 100).toFixed(1) + '%' : '0%',
            avgResolutionHours: avgResolutionTime[0] ? Math.round(avgResolutionTime[0].avgTime / (1000 * 60 * 60)) : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createComplaint,
    getMyComplaints,
    getServiceProviderComplaints,
    serviceProviderRespond,
    getAllComplaints,
    updateComplaintStatus,
    deleteComplaint,
    getComplaintStats
};
