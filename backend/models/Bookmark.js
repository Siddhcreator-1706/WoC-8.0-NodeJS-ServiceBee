const mongoose = require('mongoose');

const bookmarkSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
        index: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'Service is required'],
        index: true
    }
}, {
    timestamps: true
});

// Prevent duplicate bookmarks (unique compound index)
bookmarkSchema.index({ user: 1, service: 1 }, { unique: true });

// Validate that service exists before saving
bookmarkSchema.pre('save', async function () {
    if (this.isNew) {
        const Service = mongoose.model('Service');
        // Check if service exists (isActive true or undefined/missing)
        const serviceExists = await Service.findOne({
            _id: this.service,
            $or: [{ isActive: true }, { isActive: { $exists: false } }]
        });
        if (!serviceExists) {
            throw new Error('Referenced service does not exist or is inactive');
        }
    }
});

// Populate service details on save
bookmarkSchema.pre('save', async function () {
    if (this.isNew || this.isModified('service')) {
        await this.populate('service', 'name price location image company');
    }
});

// Update service bookmarks count
bookmarkSchema.post('save', async function () {
    const Service = mongoose.model('Service');
    try {
        const count = await this.constructor.countDocuments({ service: this.service });
        await Service.findByIdAndUpdate(this.service, { bookmarkCount: count });
    } catch (err) {
        console.error(err);
    }
});

// Validate that user exists before saving
bookmarkSchema.pre('save', async function () {
    if (this.isNew) {
        const User = mongoose.model('User');
        const userExists = await User.exists({ _id: this.user, isActive: true });
        if (!userExists) {
            throw new Error('Referenced user does not exist or is inactive');
        }
    }
});

module.exports = mongoose.model('Bookmark', bookmarkSchema);
