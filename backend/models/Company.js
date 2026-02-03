const mongoose = require('mongoose');

const companySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a company name'],
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    logo: {
        type: String, // Cloudinary URL
        default: null
    },
    logoPublicId: {
        type: String // For deletion from Cloudinary
    },
    email: {
        type: String,
        required: [true, 'Please add a company email'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    phone: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'India' }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual to get all services for this company
companySchema.virtual('services', {
    ref: 'Service',
    localField: '_id',
    foreignField: 'company'
});

// Virtual for service count
companySchema.virtual('serviceCount', {
    ref: 'Service',
    localField: '_id',
    foreignField: 'company',
    count: true
});

// Indexes
companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ owner: 1 });
companySchema.index({ isActive: 1 });

// Cascade delete: when company deleted, deactivate all services
companySchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const Service = mongoose.model('Service');
    await Service.updateMany(
        { company: this._id },
        { isActive: false }
    );
    next();
});

module.exports = mongoose.model('Company', companySchema);
