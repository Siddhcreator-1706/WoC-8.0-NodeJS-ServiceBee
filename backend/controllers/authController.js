const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const OTP = require('../models/OTP');
const PendingUser = require('../models/PendingUser');
const Session = require('../models/Session');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

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
        const {
            name,
            email,
            password,
            role,
            phone,
            city,
            state,
            companyName,
            description,
            avatar
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Validate role if provided
        const userRole = (role === 'provider') ? 'provider' : 'user';

        const cleanEmail = email.trim().toLowerCase();

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ message: 'Please use a valid email address' });
        }

        const userExists = await User.findOne({ email: cleanEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = generateOTP();

        await PendingUser.deleteMany({ email: cleanEmail });

        await PendingUser.create({
            name,
            email: cleanEmail,
            password,
            otp,
            role: userRole,
            phone,
            city,
            state,
            avatar,
            company: (userRole === 'provider' && companyName) ? {
                name: companyName,
                description,
                serviceType: req.body.serviceType,
                logo: req.body.logo
            } : undefined
        });

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

        const pendingUser = await PendingUser.findOne({ email: cleanEmail });

        if (!pendingUser) {
            return res.status(400).json({ message: 'Invalid or expired verification request. Please sign up again.' });
        }

        if (pendingUser.otp !== otp) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        const user = await User.create({
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password,
            role: pendingUser.role,
            phone: pendingUser.phone,
            city: pendingUser.city,
            state: pendingUser.state,
            avatar: pendingUser.avatar || 'default-avatar.png',
            isActive: true
        });

        if (user.role === 'provider' && pendingUser.company && pendingUser.company.name) {
            const company = await Company.create({
                name: pendingUser.company.name,
                description: pendingUser.company.description,
                email: user.email,
                phone: user.phone,
                owner: user._id,
                isVerified: true,
                serviceType: pendingUser.company.serviceType || 'General',
                logo: pendingUser.company.logo
            });

            user.company = company._id;
            await user.save();
        }

        await PendingUser.deleteOne({ _id: pendingUser._id });

        const token = generateToken(user._id);

        await Session.createSession(user._id, token, req);

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

        const pendingUser = await PendingUser.findOne({ email: cleanEmail });

        if (!pendingUser) {
            return res.status(400).json({ message: 'No pending registration found. Please sign up again.' });
        }

        const newOtp = generateOTP();

        pendingUser.otp = newOtp;
        await pendingUser.save();

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
            if (user.bannedExpiresAt && new Date() > new Date(user.bannedExpiresAt)) {
                user.isActive = true;
                user.bannedExpiresAt = undefined;
                user.deactivationReason = undefined;
                await user.save();
            } else {
                const message = user.bannedExpiresAt
                    ? `Account suspended until ${new Date(user.bannedExpiresAt).toLocaleDateString()}. Reason: ${user.deactivationReason || 'Admin Action'}`
                    : 'Account is deactivated. Contact support.';
                return res.status(403).json({ message });
            }
        }

        if (await user.matchPassword(password)) {
            const token = generateToken(user._id);

            await Session.invalidateDeviceSession(user._id, req.get('User-Agent') || 'Unknown');

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
        let token = req.cookies.jwt;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
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

        if (name) user.name = name;
        if (email) user.email = email.trim().toLowerCase();
        if (phone) user.phone = phone;
        if (city) user.city = city;
        if (state) user.state = state;

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

// @desc    Request password reset (OTP)
// @route   POST /auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address.' });
        }

        const otp = generateOTP();
        await OTP.deleteMany({ email: cleanEmail, purpose: 'password-reset' });

        await OTP.create({
            email: cleanEmail,
            otp: otp,
            name: user.name,
            password: 'N/A',
            purpose: 'password-reset',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });

        // Send OTP email
        await sendOTPEmail(cleanEmail, otp, user.name);

        res.json({ message: 'If the email exists, a verification code has been sent.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Reset OTP
// @route   POST /auth/verify-reset-otp
// @access  Public
const verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const cleanEmail = email.trim().toLowerCase();

        const otpEntry = await OTP.findOne({
            email: cleanEmail,
            purpose: 'password-reset',
            expiresAt: { $gt: new Date() }
        });

        if (!otpEntry) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        const isMatch = await otpEntry.verifyOTP(otp);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const resetToken = jwt.sign(
            { id: user._id, type: 'password-reset' },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        await OTP.deleteOne({ _id: otpEntry._id });

        res.json({
            message: 'OTP verified successfully',
            resetToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password
// @route   POST /auth/reset-password
// @access  Public (Protected by Reset Token)
const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || typeof newPassword !== 'string' || newPassword.length < 6) {
            return res.status(400).json({ message: 'Token and a valid new password (min 6 chars) are required' });
        }

        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired reset token' });
        }

        if (decoded.type !== 'password-reset') {
            return res.status(401).json({ message: 'Invalid token type' });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password reset successful. Please login with your new password.' });
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
    verifyResetOTP,
    resetPassword
};
