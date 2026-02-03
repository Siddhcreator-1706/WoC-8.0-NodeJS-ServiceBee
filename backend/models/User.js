const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    location: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superuser'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    deactivatedAt: {
        type: Date
    },
    deactivationReason: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Static method to check if user can be deleted
userSchema.statics.canDelete = async function (userId) {
    const Complaint = mongoose.model('Complaint');

    // Check for pending or in-progress complaints by this user
    const activeComplaints = await Complaint.countDocuments({
        user: userId,
        status: { $in: ['pending', 'in-progress'] }
    });

    return {
        canDelete: activeComplaints === 0,
        activeComplaintsCount: activeComplaints,
        message: activeComplaints > 0
            ? `User has ${activeComplaints} active complaint(s). Resolve them first or use soft delete.`
            : 'User can be deleted safely.'
    };
};

// Static method for soft delete (deactivate user)
userSchema.statics.softDelete = async function (userId, reason = 'Account deactivated') {
    const user = await this.findById(userId);
    if (!user) return null;

    user.isActive = false;
    user.deactivatedAt = new Date();
    user.deactivationReason = reason;
    await user.save();

    return user;
};

// Static method for force delete with cleanup
userSchema.statics.forceDelete = async function (userId) {
    const Bookmark = mongoose.model('Bookmark');
    const Complaint = mongoose.model('Complaint');
    const Service = mongoose.model('Service');

    // Delete all user's bookmarks
    await Bookmark.deleteMany({ user: userId });

    // Mark user's complaints as user-deleted (keep for admin records)
    await Complaint.updateMany(
        { user: userId },
        { $set: { status: 'user-deleted', adminResponse: 'User account has been deleted.' } }
    );

    // Remove user's ratings from services
    await Service.updateMany(
        { 'ratings.user': userId },
        { $pull: { ratings: { user: userId } } }
    );

    // Finally delete the user
    return this.findByIdAndDelete(userId);
};

// Pre-delete hook (regular delete - only works if no active complaints)
userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const userId = this._id;
    const User = mongoose.model('User');

    const check = await User.canDelete(userId);
    if (!check.canDelete) {
        return next(new Error(check.message));
    }

    // Safe delete - clean up
    const Bookmark = mongoose.model('Bookmark');
    const Complaint = mongoose.model('Complaint');
    const Service = mongoose.model('Service');

    await Bookmark.deleteMany({ user: userId });
    await Complaint.deleteMany({ user: userId });
    await Service.updateMany(
        { 'ratings.user': userId },
        { $pull: { ratings: { user: userId } } }
    );

    next();
});

module.exports = mongoose.model('User', userSchema);
