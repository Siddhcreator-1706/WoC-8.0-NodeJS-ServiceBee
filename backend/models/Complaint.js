const mongoose = require('mongoose');

const complaintSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
        index: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking is required'],
        index: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'Service is required'],
        index: true
    },
    subject: {
        type: String,
        required: [true, 'Please add a subject'],
        trim: true,
        maxlength: [100, 'Subject cannot exceed 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Please add a message'],
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    // Image attachments (Cloudinary URLs)
    images: [{
        url: String,
        publicId: String
    }],
    status: {
        type: String,
        enum: {
            values: ['pending', 'in-progress', 'awaiting-confirmation', 'resolved', 'rejected', 'service-unavailable'],
            message: '{VALUE} is not a valid status'
        },
        default: 'pending',
        index: true
    },
    adminResponse: {
        type: String,
        maxlength: [1000, 'Admin response cannot exceed 1000 characters']
    },
    serviceProviderResponse: {
        type: String,
        maxlength: [1000, 'Service provider response cannot exceed 1000 characters']
    },
    serviceProviderRespondedAt: Date,
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: Date,
    // Store service snapshot
    serviceSnapshot: {
        name: String,
        location: String,
        category: String,
        createdBy: mongoose.Schema.Types.ObjectId
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
complaintSchema.index({ user: 1, createdAt: -1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ 'serviceSnapshot.createdBy': 1, status: 1 });

// Pre-save: capture service snapshot
complaintSchema.pre('save', async function () {
    if (this.isNew) {
        // Pre-save to check if user has existing pending complaint for same service
        const existingComplaint = await this.constructor.findOne({
            user: this.user,
            service: this.service,
            status: 'pending'
        });

        if (existingComplaint && existingComplaint._id.toString() !== this._id.toString()) {
            throw new Error('You already have a pending complaint for this service');
        }

        try {
            const Service = mongoose.model('Service');
            const service = await Service.findById(this.service);
            if (service) {
                this.serviceSnapshot = {
                    name: service.name,
                    location: service.location,
                    category: service.category,
                    createdBy: service.createdBy
                };
            }
        } catch {
            // Service may not exist, continue without snapshot
        }
    }
});

// Virtual for service name
complaintSchema.virtual('serviceName').get(function () {
    return this.serviceSnapshot?.name || 'Unknown Service';
});

// Virtual to check if has response
complaintSchema.virtual('hasResponse').get(function () {
    return !!(this.adminResponse || this.serviceProviderResponse);
});

module.exports = mongoose.model('Complaint', complaintSchema);
