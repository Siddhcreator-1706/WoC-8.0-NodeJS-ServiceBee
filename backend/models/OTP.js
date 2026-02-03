const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['signup', 'password-reset'],
        default: 'signup'
    },
    attempts: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - auto-delete when expired
    }
}, {
    timestamps: true
});

// Hash OTP before saving for security
otpSchema.pre('save', async function (next) {
    if (this.isModified('otp')) {
        const salt = await bcrypt.genSalt(10);
        this.otp = await bcrypt.hash(this.otp, salt);
    }
    // Hash password for signup
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Verify OTP
otpSchema.methods.verifyOTP = async function (enteredOTP) {
    return await bcrypt.compare(enteredOTP, this.otp);
};

// Static to create OTP entry
otpSchema.statics.createOTP = async function (email, otp, name, password, purpose = 'signup') {
    // Remove any existing OTP for this email
    await this.deleteMany({ email: email.toLowerCase().trim() });

    // Create new OTP entry (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    return this.create({
        email: email.toLowerCase().trim(),
        otp,
        name,
        password,
        purpose,
        expiresAt
    });
};

module.exports = mongoose.model('OTP', otpSchema);
