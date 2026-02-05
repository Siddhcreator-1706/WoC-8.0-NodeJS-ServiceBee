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
    role: {
        type: String,
        enum: ['user', 'provider', 'admin'],
        default: 'user'
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - auto-delete when expired
    }
}, {
    timestamps: true
});

// Hash OTP before saving for security (Mongoose 9.x async middleware - no 'next' needed)
otpSchema.pre('save', async function () {
    if (this.isModified('otp')) {
        const salt = await bcrypt.genSalt(10);
        this.otp = await bcrypt.hash(this.otp, salt);
    }
    // Hash password for signup - ONLY if it's not already hashed (prevent double hashing)
    if (this.isModified('password') && !this.password.startsWith('$2a$')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    // Mongoose 9.x: async middleware auto-calls next() when promise resolves
});

// Verify OTP
otpSchema.methods.verifyOTP = async function (enteredOTP) {
    return await bcrypt.compare(enteredOTP, this.otp);
};

// Static to create OTP entry
otpSchema.statics.createOTP = async function (email, otp, name, password, purpose = 'signup', role = 'user') {
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
        role,
        expiresAt
    });
};

module.exports = mongoose.model('OTP', otpSchema);