const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    userAgent: {
        type: String,
        default: 'Unknown'
    },
    ipAddress: {
        type: String,
        default: 'Unknown'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for finding active sessions
sessionSchema.index({ userId: 1, isActive: 1 });

// TTL index to auto-delete expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if session is valid
sessionSchema.methods.isValid = function () {
    return this.isActive && this.expiresAt > new Date();
};

// Static method to create a new session
sessionSchema.statics.createSession = async function (userId, token, req, expiresInDays = 30) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const session = await this.create({
        userId,
        token,
        userAgent: req.get('User-Agent') || 'Unknown',
        ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown',
        expiresAt
    });

    return session;
};

// Static method to invalidate a session
sessionSchema.statics.invalidateSession = async function (token) {
    return await this.updateOne(
        { token },
        { $set: { isActive: false } }
    );
};

// Static method to invalidate all sessions for a user
sessionSchema.statics.invalidateAllUserSessions = async function (userId) {
    return await this.updateMany(
        { userId, isActive: true },
        { $set: { isActive: false } }
    );
};

// Static method to get active sessions for a user
sessionSchema.statics.getActiveSessions = async function (userId) {
    return await this.find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
    }).sort({ lastActivity: -1 });
};

// Static method to update last activity
sessionSchema.statics.updateActivity = async function (token) {
    return await this.updateOne(
        { token, isActive: true },
        { $set: { lastActivity: new Date() } }
    );
};

module.exports = mongoose.model('Session', sessionSchema);
