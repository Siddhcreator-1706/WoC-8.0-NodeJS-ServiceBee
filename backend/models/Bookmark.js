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
bookmarkSchema.pre('save', async function (next) {
    if (this.isNew) {
        const Service = mongoose.model('Service');
        const serviceExists = await Service.exists({ _id: this.service, isActive: true });
        if (!serviceExists) {
            return next(new Error('Referenced service does not exist or is inactive'));
        }
    }
    next();
});

// Validate that user exists before saving
bookmarkSchema.pre('save', async function (next) {
    if (this.isNew) {
        const User = mongoose.model('User');
        const userExists = await User.exists({ _id: this.user, isActive: true });
        if (!userExists) {
            return next(new Error('Referenced user does not exist or is inactive'));
        }
    }
    next();
});

module.exports = mongoose.model('Bookmark', bookmarkSchema);
