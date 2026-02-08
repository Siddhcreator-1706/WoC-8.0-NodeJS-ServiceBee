const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

const protect = async (req, res, next) => {
    let token;

    // Check for token in cookies (primary) or Authorization header (fallback)
    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded:', decoded);

        // Check session validity in database
        const session = await Session.findOne({
            userId: decoded.id,
            token,
            isActive: true
        });

        console.log('Session found:', session ? session._id : 'null');

        if (!session) {
            console.log('Session lookup failed for token:', token.substring(0, 20) + '...');

            // Debug: Check if ANY session exists for this user
            const anySession = await Session.find({ userId: decoded.id });
            console.log(`Debug: User ${decoded.id} has ${anySession.length} total sessions.`);
            if (anySession.length > 0) {
                console.log('Sample session token:', anySession[0].token.substring(0, 20) + '...');
                console.log('Sample session isActive:', anySession[0].isActive);
            }

            return res.status(401).json({ message: 'Session expired or invalid (No Session Found)' });
        }

        // Manual expiration check
        if (session.expiresAt && new Date() > session.expiresAt) {
            console.log('Session expired by date');
            return res.status(401).json({ message: 'Session expired' });
        }

        req.user = await User.findById(decoded.id).select('-password');
        console.log('User found:', req.user ? req.user._id : 'No user');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Update session activity
        await Session.updateActivity(token);

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error); // Changed to console.error
        res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
    }
};

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
