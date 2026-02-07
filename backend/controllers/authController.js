const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Company = require('../models/Company');
const OTP = require('../models/OTP'); // Keep for password reset
const PendingUser = require('../models/PendingUser');
const Session = require('../models/Session');
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
        const { name, email, password, role, phone, city, state, companyName, serviceType, description, logo, avatar } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Validate role if provided
        let userRole = (role === 'provider') ? 'provider' : 'user';

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

        // Remove any existing pending user for this email
        await PendingUser.deleteMany({ email: cleanEmail });

        // Create Pending User (password hashed by pre-save hook)
        // Store OTP as plain text in PendingUser (as per schema)
        await PendingUser.create({
            name,
            email: cleanEmail,
            password,
            otp,
            role: userRole,
            phone,
            city,
            state,
            avatar, // Store avatar URL
            company: (userRole === 'provider' && companyName) ? {
                name: companyName,
                description,
                serviceType: req.body.serviceType, // Keep this just in case, though optional
                logo: req.body.logo
            } : undefined
        });

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

        // Find Pending User
        const pendingUser = await PendingUser.findOne({ email: cleanEmail });

        if (!pendingUser) {
            return res.status(400).json({ message: 'Invalid or expired verification request. Please sign up again.' });
        }

        // Verify OTP (Direct comparison as stored plain text in PendingUser)
        if (pendingUser.otp !== otp) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // OTP valid - create user
        // pendingUser.password is already hashed
        const user = await User.create({
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password, // already hashed
            role: pendingUser.role,
            phone: pendingUser.phone,
            city: pendingUser.city,
            state: pendingUser.state,
            avatar: pendingUser.avatar || 'default-avatar.png', // Transfer avatar
            isActive: true
        });

        // If provider, create company
        if (user.role === 'provider' && pendingUser.company && pendingUser.company.name) {
            await Company.create({
                name: pendingUser.company.name,
                description: pendingUser.company.description,
                email: user.email,
                phone: user.phone,
                owner: user._id,
                isVerified: true, // Auto-verify since OTP passed
                serviceType: pendingUser.company.serviceType || 'General',
                logo: pendingUser.company.logo
            });
        }

        // Delete pending user
        await PendingUser.deleteOne({ _id: pendingUser._id });

        // Auto-login: Generate token
        const token = generateToken(user._id);

        // Create session
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const ip = req.ip || req.connection.remoteAddress;

        // Create session in DB
        const session = await Session.create({
            user: user._id,
            token,
            userAgent,
            ipAddress: ip,
            lastActive: new Date()
        });

        // Set cookies
        res.cookie('jwt', token, cookieOptions);
        res.cookie('logged_in', 'true', {
            ...cookieOptions,
            httpOnly: false
        });

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            city: user.city,
            state: user.state,
            avatar: user.avatar
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

        // Find existing Pending User
        const pendingUser = await PendingUser.findOne({ email: cleanEmail });

        if (!pendingUser) {
            return res.status(400).json({ message: 'No pending registration found. Please sign up again.' });
        }

        // Generate new OTP
        const newOtp = generateOTP();

        // Update with new OTP (password remains same hashed value)
        pendingUser.otp = newOtp;
        // Reset expiration by resetting createdAt? or just save? 
        // Logic: if we update, we might want to extend time. 
        // Since TTL is on createdAt, we'd need to update createdAt to extend.
        // But for simplicity, we just update OTP. The original 24h window applies.
        await pendingUser.save();

        // Send email
        const emailResult = await sendOTPEmail(cleanEmail, newOtp, pendingUser.name);

        if (!emailResult.success) {
            return res.status(500).json({ message: 'Failed to send email' });
        }

        res.status(200).json({ message: 'Verification code resent' });
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

            // Create Session
            await Session.createSession(user._id, token, req);

            res.cookie('jwt', token, cookieOptions);
            res.cookie('logged_in', 'true', { ...cookieOptions, httpOnly: false });

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error details:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /auth/logout
// @access  Private
const logoutUser = async (req, res) => {
    try {
        // Get token from cookie or header
        let token;
        if (req.cookies.jwt) {
            token = req.cookies.jwt;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            await Session.invalidateSession(token);
        }

        res.cookie('jwt', '', { ...cookieOptions, maxAge: 0 });
        res.cookie('logged_in', '', { ...cookieOptions, httpOnly: false, maxAge: 0 });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout from all devices
// @route   POST /auth/logout-all
// @access  Private
const logoutAll = async (req, res) => {
    try {
        await Session.deleteMany({ user: req.user._id });

        res.cookie('jwt', '', { ...cookieOptions, maxAge: 0 });
        res.cookie('logged_in', '', { ...cookieOptions, httpOnly: false, maxAge: 0 });
        res.status(200).json({ message: 'Logged out from all devices successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
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
        const { name, email, phone, city, state, currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update basic info
        if (name) user.name = name;
        if (email) user.email = email.trim().toLowerCase();
        if (phone) user.phone = phone;
        if (city) user.city = city;
        if (state) user.state = state;

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
    logoutAll,
    getMe,
    updateProfile,
    forgotPassword,
    resetPassword
};
