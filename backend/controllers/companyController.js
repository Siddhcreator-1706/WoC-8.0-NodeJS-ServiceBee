const Company = require('../models/Company');
const Service = require('../models/Service');
const { uploadCompanyLogo, deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');

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

        res.json(company);
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

        res.json(company);
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

        // Only owner or superuser can update
        if (company.owner.toString() !== req.user._id.toString() && req.user.role !== 'superuser') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { name, description, email, phone, website, address, socialLinks } = req.body;

        if (name) company.name = name;
        if (description) company.description = description;
        if (email) company.email = email;
        if (phone) company.phone = phone;
        if (website) company.website = website;
        if (address) company.address = { ...company.address, ...address };
        if (socialLinks) company.socialLinks = { ...company.socialLinks, ...socialLinks };

        await company.save();
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload company logo
// @route   POST /api/companies/:id/logo
// @access  Private (owner)
const uploadLogo = async (req, res) => {
    uploadCompanyLogo(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        try {
            const company = await Company.findById(req.params.id);

            if (!company) {
                return res.status(404).json({ message: 'Company not found' });
            }

            if (company.owner.toString() !== req.user._id.toString() && req.user.role !== 'superuser') {
                return res.status(403).json({ message: 'Not authorized' });
            }

            // Delete old logo if exists
            if (company.logoPublicId) {
                await deleteImage(company.logoPublicId);
            }

            company.logo = req.file.path;
            company.logoPublicId = req.file.filename;
            await company.save();

            res.json({ logo: company.logo, message: 'Logo uploaded successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
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

        if (company.owner.toString() !== req.user._id.toString() && req.user.role !== 'superuser') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete logo from Cloudinary
        if (company.logoPublicId) {
            await deleteImage(company.logoPublicId);
        }

        await company.deleteOne();
        res.json({ message: 'Company removed' });
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
