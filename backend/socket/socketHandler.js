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

        socket.join(userId);
        console.log(`🔌 User connected: ${socket.user.name} (${userId})`);

        io.emit('user:online', { userId, name: socket.user.name });

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

        socket.on('complaint:create', (data) => {
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

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.user.name} (${userId})`);
            io.emit('user:offline', { userId });
        });
    });
};

module.exports = { initializeSocket };
