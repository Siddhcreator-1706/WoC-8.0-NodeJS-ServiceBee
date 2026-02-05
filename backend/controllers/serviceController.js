const Service = require('../models/Service');
const { uploadServiceImage, deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');

// @desc    Get all services with filters
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
    try {
        const {
            location, category, minPrice, maxPrice, minRating,
            featured, search, sortBy, company, page = 1, limit = 12
        } = req.query;

        const filter = { isActive: true };

        if (location) filter.location = { $regex: location, $options: 'i' };
        if (category) filter.category = category;
        if (company) filter.company = company;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (featured === 'true') filter.featured = true;
        if (search) filter.$text = { $search: search };

        let sort = { createdAt: -1 };
        if (sortBy === 'price-asc') sort = { price: 1 };
        if (sortBy === 'price-desc') sort = { price: -1 };
        if (sortBy === 'rating') sort = { 'ratings.length': -1 };
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

// @desc    Get featured services
// @route   GET /api/services/featured
// @access  Public
const getFeaturedServices = async (req, res) => {
    try {
        const services = await Service.find({ featured: true, isActive: true })
            .populate('company', 'name logo')
            .limit(6);
        res.json(services);
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
            .populate('company', 'name logo email phone')
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
        let { name, description, price, priceType, location, category, company, featured, tags, duration } = req.body;

        // If provider, ensure they own a company and link it
        if (req.user.role === 'provider') {
            const Company = require('../models/Company');
            const userCompany = await Company.findOne({ owner: req.user._id });

            if (!userCompany) {
                return res.status(400).json({ message: 'Please create a company profile first' });
            }

            // Force company ID to be the provider's company
            company = userCompany._id;

            // Providers cannot set featured status (admin only)
            featured = false;
        }

        const service = await Service.create({
            name,
            description,
            price,
            priceType,
            location,
            category,
            company,
            featured,
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            duration,
            createdBy: req.user._id
        });

        res.status(201).json(service);
    } catch (error) {
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

        service.image = req.file.path;
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
        if (service.createdBy.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { tags, ...updateData } = req.body;
        if (tags) updateData.tags = tags.split(',').map(t => t.trim());

        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

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
        const { force, soft } = req.query;
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && service.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
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

module.exports = {
    getServices,
    getFeaturedServices,
    getLocations,
    getServiceById,
    createService,
    uploadImage,
    updateService,
    deleteService,
    rateService
};
