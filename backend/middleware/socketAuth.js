const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cookie = require('cookie');

/**
 * Socket.IO authentication middleware.
 * Verifies JWT from handshake auth token or cookies.
 * Attaches user data to socket.user on success.
 */
const socketAuth = async (socket, next) => {
    try {
        if (socket.handshake.auth && socket.handshake.auth.token) {
            token = socket.handshake.auth.token;
        } else if (socket.handshake.headers.cookie) {
            const cookies = cookie.parse(socket.handshake.headers.cookie);
            token = cookies.jwt;
        }

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        if (!user.isActive) {
            return next(new Error('Authentication error: Account deactivated'));
        }

        socket.user = user;
        next();
    } catch (error) {
        next(new Error('Authentication error: Invalid token'));
    }
};

module.exports = socketAuth;
