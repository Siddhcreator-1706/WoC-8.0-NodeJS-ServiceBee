const { setIO } = require('./emitter');

/**
 * Initialize Socket.IO event handlers.
 * Each connected user joins a room named after their user ID
 * so we can target messages to specific users.
 */
const initializeSocket = (io) => {
    setIO(io);

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();

        // Join user-specific room
        socket.join(userId);
        console.log(`🔌 User connected: ${socket.user.name} (${userId})`);

        // Broadcast online status
        io.emit('user:online', { userId, name: socket.user.name });

        // Broadcasting online status remains as it identifies users in the system
        io.emit('user:online', { userId, name: socket.user.name });

        // ─── Booking Events ─────────────────────────────────────────

        socket.on('booking:create', (data) => {
            const { receiverId, booking } = data;
            if (receiverId) {
                io.to(receiverId).emit('booking:new', { booking, userName: socket.user.name });
            }
        });

        socket.on('booking:update', (data) => {
            const { receiverId, booking } = data;
            if (receiverId) {
                io.to(receiverId).emit('booking:updated', { booking });
            }
        });

        // ─── Complaint Events ───────────────────────────────────────

        socket.on('complaint:create', (data) => {
            // Complaints might be broadcast to admins or specific providers
            // For now, we'll just emit to the receiver if specified
            const { receiverId, complaint } = data;
            if (receiverId) {
                io.to(receiverId).emit('complaint:new', { complaint, userName: socket.user.name });
            }
        });

        socket.on('complaint:update', (data) => {
            const { receiverId, complaint } = data;
            if (receiverId) {
                io.to(receiverId).emit('complaint:updated', { complaint });
            }
        });

        // ─── Disconnect ─────────────────────────────────────────────

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.user.name} (${userId})`);
            io.emit('user:offline', { userId });
        });
    });
};

module.exports = { initializeSocket };
