const mongoose = require('mongoose');

// Support contact info
const SUPPORT_CONTACT = {
    email: process.env.SUPPORT_EMAIL || 'support@servicebee.com',
    phone: process.env.SUPPORT_PHONE || '+1-800-SERVICE',
    message: 'The service you complained about has been removed. Please contact our support team.'
};

const ratingSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        maxlength: 500
    }
}, { _id: true, timestamps: true });

const serviceSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a service name'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: 0
    },
    priceType: {
        type: String,
        enum: ['fixed', 'hourly', 'starting-from', 'quote'],
        default: 'fixed'
    },
    state: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['cleaning', 'repair', 'beauty', 'tech', 'moving', 'events', 'plumbing', 'electrical', 'painting', 'gardening', 'other', 'ritual', 'cleansing', 'exorcism', 'divination', 'astrology'],
        default: 'other'
    },
    image: {
        type: String, // Cloudinary URL
        default: null
    },
    imagePublicId: {
        type: String // For Cloudinary deletion
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Link to company (one company can have multiple services)
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        index: true
    },
    ratings: [ratingSchema],
    duration: {
        type: String, // e.g., "1-2 hours", "Same day"
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for average rating
serviceSchema.virtual('averageRating').get(function () {
    if (!this.ratings || this.ratings.length === 0) return 0;
    const sum = this.ratings.reduce((acc, r) => acc + r.value, 0);
    return parseFloat((sum / this.ratings.length).toFixed(1));
});

// Virtual for total reviews
serviceSchema.virtual('totalReviews').get(function () {
    return this.ratings ? this.ratings.length : 0;
});

// Indexes (company already indexed via index: true in schema)
serviceSchema.index({ name: 'text', description: 'text', location: 'text' });
serviceSchema.index({ category: 1, location: 1, price: 1 });
serviceSchema.index({ createdBy: 1 });

// Static methods
serviceSchema.statics.canDelete = async function (serviceId) {
    const Complaint = mongoose.model('Complaint');
    const activeComplaints = await Complaint.countDocuments({
        service: serviceId,
        status: { $in: ['pending', 'in-progress'] }
    });
    return {
        canDelete: activeComplaints === 0,
        activeComplaintsCount: activeComplaints,
        message: activeComplaints > 0
            ? `Cannot delete: ${activeComplaints} active complaint(s) exist.`
            : 'Service can be deleted safely.'
    };
};

serviceSchema.statics.softDelete = async function (serviceId) {
    return this.findByIdAndUpdate(serviceId, { isActive: false }, { new: true });
};

serviceSchema.statics.forceDelete = async function (serviceId, serviceName) {
    const Complaint = mongoose.model('Complaint');
    const Bookmark = mongoose.model('Bookmark');

    await Complaint.updateMany(
        { service: serviceId, status: { $in: ['pending', 'in-progress'] } },
        {
            status: 'service-unavailable',
            adminResponse: `${SUPPORT_CONTACT.message}\n\nService: ${serviceName}\nSupport: ${SUPPORT_CONTACT.email}`
        }
    );
    await Complaint.deleteMany({ service: serviceId, status: { $in: ['resolved', 'rejected'] } });
    await Bookmark.deleteMany({ service: serviceId });
    return this.findByIdAndDelete(serviceId);
};

// Pre-delete hook
// Pre-delete hook
serviceSchema.pre('deleteOne', { document: true, query: false }, async function () {
    const serviceId = this._id;
    const Service = mongoose.model('Service');
    const check = await Service.canDelete(serviceId);
    if (!check.canDelete) {
        throw new Error(check.message);
    }
    const Bookmark = mongoose.model('Bookmark');
    const Complaint = mongoose.model('Complaint');
    await Bookmark.deleteMany({ service: serviceId });
    await Complaint.deleteMany({ service: serviceId });
});

module.exports = mongoose.model('Service', serviceSchema);
