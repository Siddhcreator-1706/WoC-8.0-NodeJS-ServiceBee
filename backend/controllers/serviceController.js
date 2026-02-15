const Service = require('../models/Service');
const Complaint = require('../models/Complaint');
const Bookmark = require('../models/Bookmark');
const { uploadServiceImage, deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');
const { escapeRegex } = require('../utils/security');
const { getIO } = require('../socket/emitter');
const { sendServiceActionEmail } = require('../utils/emailService');

// @desc    Get all services with filters
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
    try {
        const {
            location, category, minPrice, maxPrice, minRating,
            search, sortBy, company, page = 1, limit = 12,
            state, city
        } = req.query;

        const filter = { isActive: true };

        if (state) filter.state = state;
        if (city) filter.city = city;
        if (category) filter.category = category;
        if (company) filter.company = company;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        if (search) filter.$text = { $search: search };

        let sort = { createdAt: -1 };
        if (sortBy === 'price-asc') sort = { price: 1 };
        if (sortBy === 'price-desc') sort = { price: -1 };
        if (sortBy === 'rating') sort = { averageRating: -1 };
        if (sortBy === 'newest') sort = { createdAt: -1 };

        const skip = (Number(page) - 1) * Number(limit);

        const [services, total] = await Promise.all([
            Service.find(filter)
                .populate('company', 'name logo')
                .populate('createdBy', 'name')
                .sort(sort)
                .skip(skip)
                .limit(Number(limit)),
            Service.countDocuments(filter)
        ]);

        let filteredServices = services;
        if (minRating) {
            filteredServices = services.filter(s => s.averageRating >= Number(minRating));
        }

        res.json({
            services: filteredServices,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all locations
// @route   GET /api/services/locations
// @access  Public
const getLocations = async (req, res) => {
    try {
        const locations = await Service.distinct('location', { isActive: true });
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate('company', 'name logo email phone website socialLinks')
            .populate('ratings.user', 'name');

        if (service && service.isActive) {
            res.json(service);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Admin/Superuser
const createService = async (req, res) => {
    try {
        let { name, description, price, priceType, location, state, city, category, company, duration } = req.body;

        // If provider, ensure they own a company and link it
        if (req.user.role === 'provider') {
            const Company = require('../models/Company');
            const userCompany = await Company.findOne({ owner: req.user._id });

            if (!userCompany) {
                return res.status(400).json({ message: 'Please create a company profile first' });
            }

            // Force company ID to be the provider's company
            company = userCompany._id;
        }

        const service = await Service.create({
            name,
            description,
            price,
            priceType,
            location,
            state,
            city,
            category,
            company,
            duration,
            createdBy: req.user._id
        });

        // Emit real-time event
        const io = getIO();
        if (io) {
            io.emit('service:created', { serviceId: service._id, name: service.name });
        }

        res.status(201).json(service);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload service image
// @route   POST /api/services/:id/image
// @access  Private/Admin/Superuser
const uploadImage = async (req, res) => {
    try {
        // Run multer middleware (Promise-based for multer v2)
        await uploadServiceImage(req, res);

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Check authorization
        if (service.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete old image if exists
        if (service.imagePublicId) {
            await deleteImage(service.imagePublicId);
        }

        // Use secure_url if available (standard for Cloudinary), fallback to path
        service.image = req.file.secure_url || req.file.path;
        service.imagePublicId = req.file.filename;
        await service.save();

        res.json({ image: service.image, message: 'Image uploaded successfully' });
    } catch (error) {
        res.status(error.code === 'LIMIT_FILE_SIZE' ? 400 : 500).json({ message: error.message });
    }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin/Superuser
const updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Check authorization
        // Admins are NOT allowed to edit, only delete. Only the creator can edit.
        if (service.createdBy.toString() !== req.user._id.toString()) {
            if (req.user.role === 'admin') {
                return res.status(403).json({ message: 'Admins are not authorized to edit services. Only deletions are allowed.' });
            }
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updateData = req.body;

        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        // Emit real-time event
        const io = getIO();
        if (io) {
            io.emit('service:updated', { serviceId: updatedService._id, name: updatedService.name });
        }

        res.json(updatedService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Superuser
const deleteService = async (req, res) => {
    try {
        const { force, soft, reason } = req.query;
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && service.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Send email notification if Admin is performing the action on another user's service
        if (req.user.role === 'admin' && service.createdBy.toString() !== req.user._id.toString()) {
            await service.populate('createdBy', 'email name');
            if (service.createdBy) {
                const actionType = soft === 'true' ? 'suspended' : 'deleted';
                const actionReason = reason || 'Violation of terms of service';

                // Send email asynchronously (don't block response too long, or await if critical)
                await sendServiceActionEmail(
                    service.createdBy.email,
                    service.name,
                    actionType,
                    actionReason,
                    service.createdBy.name
                );
            }
        }

        if (soft === 'true') {
            await Service.softDelete(req.params.id);
            return res.json({ message: 'Service deactivated successfully' });
        }

        const canDeleteCheck = await Service.canDelete(req.params.id);

        if (!canDeleteCheck.canDelete) {
            if (force === 'true') {
                // Delete image from Cloudinary
                if (service.imagePublicId) {
                    await deleteImage(service.imagePublicId);
                }
                await Service.forceDelete(req.params.id, service.name);
                return res.json({
                    message: 'Service force deleted',
                    affectedComplaints: canDeleteCheck.activeComplaintsCount
                });
            }

            return res.status(400).json({
                message: canDeleteCheck.message,
                options: {
                    softDelete: '?soft=true to deactivate',
                    forceDelete: '?force=true to force delete'
                }
            });
        }

        // Delete image from Cloudinary
        if (service.imagePublicId) {
            await deleteImage(service.imagePublicId);
        }

        await service.deleteOne();


        // Emit real-time event
        const io = getIO();
        if (io) {
            io.emit('service:deleted', { serviceId: req.params.id });
        }

        res.json({ message: 'Service removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Rate a service
// @route   POST /api/services/:id/rate
// @access  Private
const rateService = async (req, res) => {
    try {
        const { value, review } = req.body;

        if (!value || value < 1 || value > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const service = await Service.findById(req.params.id);

        if (!service || !service.isActive) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Check for verified booking
        const Booking = require('../models/Booking');
        const hasBooking = await Booking.findOne({
            user: req.user._id,
            service: req.params.id,
            status: 'completed'
        });

        if (!hasBooking) {
            return res.status(403).json({ message: 'You can only rate services you have booked and completed' });
        }

        const existingIndex = service.ratings.findIndex(
            r => r.user.toString() === req.user._id.toString()
        );
        if (existingIndex !== -1) {
            service.ratings[existingIndex].value = value;
            if (review) service.ratings[existingIndex].review = review;
        } else {
            service.ratings.push({ user: req.user._id, value, review });
        }

        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's own reviews
// @route   GET /api/services/my-reviews
// @access  Private
const getMyReviews = async (req, res) => {
    try {
        const services = await Service.find({
            'ratings.user': req.user._id
        }).populate('company', 'name logo');

        const reviews = services.map(service => {
            const rating = service.ratings.find(r => r.user.toString() === req.user._id.toString());
            // Defensive check: if for some reason rating is not found (shouldn't happen with query), skip it
            if (!rating) return null;
            return {
                serviceId: service._id,
                serviceName: service.name,
                company: service.company,
                value: rating.value,
                review: rating.review,
                createdAt: rating.createdAt
            };
        }).filter(r => r !== null);

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get featured services (highest rated)
// @route   GET /api/services/featured
// @access  Public
const getFeaturedServices = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true })
            .sort({ averageRating: -1 })
            .limit(6)
            .populate('company', 'name logo');
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getServices,
    getFeaturedServices,
    getLocations,
    getServiceById,
    createService,
    uploadImage,
    updateService,
    deleteService,
    rateService,
    getMyReviews
};
