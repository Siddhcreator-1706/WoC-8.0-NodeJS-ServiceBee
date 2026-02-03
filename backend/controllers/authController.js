const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP, sendOTPEmail, sendPasswordResetEmail } = require('../utils/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

// @desc    Initiate signup with OTP
// @route   POST /auth/signup
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Properly handle email - preserve dots
        const cleanEmail = email.trim().toLowerCase();

        // Check if email is valid format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ message: 'Please use a valid email address' });
        }

        const userExists = await User.findOne({ email: cleanEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate OTP
        const otp = generateOTP();

        // Store OTP with user data (for verification)
        await OTP.createOTP(cleanEmail, otp, name, password, 'signup');

        // Send OTP email
        const emailResult = await sendOTPEmail(cleanEmail, otp, name);

        if (!emailResult.success) {
            return res.status(500).json({
                message: 'Failed to send verification email. Please try again.',
                error: emailResult.error
            });
        }

        res.status(200).json({
            message: 'Verification code sent to your email',
            email: cleanEmail,
            requiresVerification: true
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP and complete signup
// @route   POST /auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Find OTP entry
        const otpEntry = await OTP.findOne({
            email: cleanEmail,
            purpose: 'signup',
            expiresAt: { $gt: new Date() }
        });

        if (!otpEntry) {
            return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
        }

        // Check attempts (max 5)
        if (otpEntry.attempts >= 5) {
            await OTP.deleteOne({ _id: otpEntry._id });
            return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
        }

        // Verify OTP
        const isValid = await otpEntry.verifyOTP(otp);

        if (!isValid) {
            otpEntry.attempts += 1;
            await otpEntry.save();
            return res.status(400).json({
                message: 'Invalid OTP',
                attemptsRemaining: 5 - otpEntry.attempts
            });
        }

        // OTP valid - create user (password already hashed in OTP model)
        const user = await User.create({
            name: otpEntry.name,
            email: cleanEmail,
            password: otpEntry.password, // Already hashed
            role: 'user',
            isActive: true
        });

        // Skip password hashing since it's already hashed
        user.isNew = false;

        // Delete OTP entry
        await OTP.deleteOne({ _id: otpEntry._id });

        // Generate token and set cookies
        const token = generateToken(user._id);
        res.cookie('jwt', token, cookieOptions);
        res.cookie('logged_in', 'true', { ...cookieOptions, httpOnly: false });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            message: 'Email verified successfully!'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Resend OTP
// @route   POST /auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const cleanEmail = email.trim().toLowerCase();

        // Find existing OTP entry
        const existingOTP = await OTP.findOne({ email: cleanEmail, purpose: 'signup' });

        if (!existingOTP) {
            return res.status(400).json({ message: 'No pending verification found. Please sign up again.' });
        }

        // Generate new OTP
        const newOtp = generateOTP();

        // Update OTP entry
        await OTP.deleteOne({ email: cleanEmail });
        await OTP.createOTP(cleanEmail, newOtp, existingOTP.name, existingOTP.password, 'signup');

        // Send email
        const emailResult = await sendOTPEmail(cleanEmail, newOtp, existingOTP.name);

        if (!emailResult.success) {
            return res.status(500).json({ message: 'Failed to send email' });
        }

        res.json({ message: 'New verification code sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated. Contact support.' });
        }

        if (await user.matchPassword(password)) {
            const token = generateToken(user._id);

            res.cookie('jwt', token, cookieOptions);
            res.cookie('logged_in', 'true', { ...cookieOptions, httpOnly: false });

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /auth/logout
// @access  Private
const logoutUser = (req, res) => {
    res.cookie('jwt', '', { ...cookieOptions, maxAge: 0 });
    res.cookie('logged_in', '', { ...cookieOptions, httpOnly: false, maxAge: 0 });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user data
// @route   GET /auth/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// @desc    Update user profile
// @route   PUT /auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, location, currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update basic info
        if (name) user.name = name;
        if (email) user.email = email.trim().toLowerCase();
        if (phone) user.phone = phone;
        if (location) user.location = location;

        // Update password if provided
        if (currentPassword && newPassword) {
            const isMatch = await user.matchPassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            user.password = newPassword;
        }

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request password reset
// @route   POST /auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            // Don't reveal if email exists
            return res.json({ message: 'If the email exists, a reset link has been sent.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Store in OTP collection (reusing for reset tokens)
        await OTP.deleteMany({ email: cleanEmail, purpose: 'password-reset' });
        await OTP.create({
            email: cleanEmail,
            otp: hashedToken,
            name: user.name,
            password: 'N/A', // Not needed for reset
            purpose: 'password-reset',
            expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        });

        // Send email
        await sendPasswordResetEmail(cleanEmail, resetToken, user.name);

        res.json({ message: 'If the email exists, a reset link has been sent.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password
// @route   POST /auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const otpEntry = await OTP.findOne({
            otp: hashedToken,
            purpose: 'password-reset',
            expiresAt: { $gt: new Date() }
        });

        if (!otpEntry) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const user = await User.findOne({ email: otpEntry.email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        user.password = password;
        await user.save();

        // Delete reset token
        await OTP.deleteOne({ _id: otpEntry._id });

        res.json({ message: 'Password reset successful. Please login.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    verifyOTP,
    resendOTP,
    loginUser,
    logoutUser,
    getMe,
    updateProfile,
    forgotPassword,
    resetPassword
};
