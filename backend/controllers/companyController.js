const Company = require('../models/Company');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const { uploadCompanyLogo, deleteImage } = require('../config/cloudinary');

// @desc    Create a company
// @route   POST /api/companies
// @access  Private (admin/superuser)
const createCompany = async (req, res) => {
    try {
        const { name, description, email, phone, website, address } = req.body;

        // Check if user already has a company
        const existingCompany = await Company.findOne({ owner: req.user._id });
        if (existingCompany) {
            return res.status(400).json({ message: 'You already have a company registered' });
        }

        const company = await Company.create({
            name,
            description,
            email,
            phone,
            website,
            address,
            owner: req.user._id
        });

        res.status(201).json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
const getCompanies = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const filter = { isActive: true };

        if (search) {
            filter.$text = { $search: search };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [companies, total] = await Promise.all([
            Company.find(filter)
                .populate('owner', 'name email')
                .populate('serviceCount')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Company.countDocuments(filter)
        ]);

        res.json({
            companies,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single company with services
// @route   GET /api/companies/:id
// @access  Public
const getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id)
            .populate('owner', 'name email')
            .populate({
                path: 'services',
                match: { isActive: true },
                options: { sort: { createdAt: -1 } }
            });

        if (!company || !company.isActive) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Calculate stats
        const completedBookings = await Booking.countDocuments({
            company: company._id,
            status: 'completed'
        });

        // Calculate average rating across all services
        let totalRating = 0;
        let totalReviews = 0;

        company.services.forEach(service => {
            if (service.ratings && service.ratings.length > 0) {
                const serviceTotal = service.ratings.reduce((sum, r) => sum + r.value, 0);
                totalRating += serviceTotal;
                totalReviews += service.ratings.length;
            }
        });

        const overallRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(2) : 0;

        // Return combined data
        const companyData = company.toObject();
        companyData.stats = {
            completedBookings,
            overallRating,
            totalReviews
        };

        res.json(companyData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my company
// @route   GET /api/companies/me
// @access  Private
const getMyCompany = async (req, res) => {
    try {
        const company = await Company.findOne({ owner: req.user._id })
            .populate({
                path: 'services',
                options: { sort: { createdAt: -1 } }
            });

        if (!company) {
            return res.status(404).json({ message: 'You have not registered a company yet' });
        }

        // Calculate stats
        const completedBookings = await Booking.countDocuments({
            company: company._id,
            status: 'completed'
        });

        // Calculate average rating across all services
        let totalRating = 0;
        let totalReviews = 0;

        company.services.forEach(service => {
            if (service.ratings && service.ratings.length > 0) {
                const serviceTotal = service.ratings.reduce((sum, r) => sum + r.value, 0);
                totalRating += serviceTotal;
                totalReviews += service.ratings.length;
            }
        });

        const overallRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(2) : 0;

        // Return combined data
        const companyData = company.toObject();
        companyData.stats = {
            completedBookings,
            overallRating,
            totalReviews
        };

        res.json(companyData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (owner)
const updateCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Only owner or admin can update
        if (company.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { name, description, email, phone, website, address } = req.body;

        if (name) company.name = name;
        if (description) company.description = description;
        if (email) company.email = email;
        if (phone) company.phone = phone;
        if (website) company.website = website;
        if (address) {
            // Handle address whether sent as object or individual fields (if from FormData)
            // If sent as JSON string (common in FormData for objects)
            if (typeof address === 'string') {
                try {
                    const parsedAddress = JSON.parse(address);
                    company.address = { ...company.address, ...parsedAddress };
                } catch (e) {
                    // Assume it's a partial update? No, FormData usually sends "address[city]" but multer doesn't nest them automatically unless configured or using a specific parser. 
                    // For simplicity, let's assume if it's a string it might be just one field if not JSON? 
                    // Actually, if using simple FormData append, we might not get nested objects easily without JSON.stringify on frontend.
                    // But Dashboard.jsx does NOT JSON.stringify address currently. 
                    // Dashboard.jsx sends: formData.append('address', ...)? No, let's check Dashboard.jsx again.
                    // It actually didn't explicitly append address in the restored code! 
                    // "Append address fields individually if needed or as JSON. For now simple string append for specific fields"
                    // Wait, the restored Dashboard.jsx code had a COMMENT about address but didn't actually append it!
                    // I need to fix Dashboard.jsx to send address properly too.
                }
            } else {
                company.address = { ...company.address, ...address };
            }
        }

        // Handle Social Links similarly if needed

        // Handle Logo Upload
        if (req.file) {
            // Delete old logo if exists
            if (company.logoPublicId) {
                await deleteImage(company.logoPublicId);
            }
            company.logo = req.file.secure_url || req.file.path;
            company.logoPublicId = req.file.filename;
        }

        await company.save();

        res.json(company);
    } catch (error) {
        console.error('Update Company Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload company logo
// @route   POST /api/companies/:id/logo
// @access  Private (owner)
const uploadLogo = async (req, res) => {
    try {
        // Run multer middleware (Promise-based for multer v2)
        await uploadCompanyLogo(req, res);

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        if (company.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete old logo if exists
        if (company.logoPublicId) {
            await deleteImage(company.logoPublicId);
        }

        company.logo = req.file.secure_url || req.file.path;
        company.logoPublicId = req.file.filename;
        await company.save();

        res.json({ logo: company.logo, message: 'Logo uploaded successfully' });
    } catch (error) {
        res.status(error.code === 'LIMIT_FILE_SIZE' ? 400 : 500).json({ message: error.message });
    }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (owner or superuser)
const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        if (company.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete logo from Cloudinary
        if (company.logoPublicId) {
            await deleteImage(company.logoPublicId);
        }

        // Cascade delete: Remove all services associated with this company
        await Service.deleteMany({ company: company._id });

        await company.deleteOne();
        res.json({ message: 'Company and its services removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify company (admin only)
// @route   PUT /api/companies/:id/verify
// @access  Private (superuser)
const verifyCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json({ message: 'Company verified', company });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCompany,
    getCompanies,
    getCompanyById,
    getMyCompany,
    updateCompany,
    uploadLogo,
    deleteCompany,
    verifyCompany
};
