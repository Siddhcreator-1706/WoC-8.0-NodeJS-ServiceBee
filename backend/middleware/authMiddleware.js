const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

const protect = async (req, res, next) => {
    let token;

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

        const session = await Session.findOne({
            userId: decoded.id,
            token,
            isActive: true
        });

        if (!session) {
            return res.status(401).json({ message: 'Session expired or invalid (No Session Found)' });
        }

        if (session.expiresAt && new Date() > session.expiresAt) {
            return res.status(401).json({ message: 'Session expired' });
        }

        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        await Session.updateActivity(token);

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error); // Changed to console.error
        res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
    }
};

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
