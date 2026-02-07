const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const pendingUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: ['user', 'provider', 'admin'],
        default: 'user'
    },
    otp: {
        type: String,
        required: true
    },
    avatar: String, // Temporary storage for user avatar
    // Extended fields for profile/company handling
    phone: String,
    city: String,
    state: String,
    company: {
        name: String,
        description: String,
        serviceType: String,
        logo: String // Add logo
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Automatically delete after 24 hours
    }
});

// Hash password before saving
pendingUserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);
