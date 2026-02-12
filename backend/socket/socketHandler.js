const ChatMessage = require('../models/ChatMessage');
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

        // ─── Chat Events ────────────────────────────────────────────

        /**
         * chat:send - Send a message to another user
         * Payload: { receiverId: string, message: string }
         */
        socket.on('chat:send', async (data) => {
            try {
                const { receiverId, message } = data;

                if (!receiverId || !message || !message.trim()) {
                    return socket.emit('chat:error', { message: 'Invalid message data' });
                }

                // Save to MongoDB
                const chatMessage = await ChatMessage.create({
                    sender: userId,
                    receiver: receiverId,
                    message: message.trim()
                });

                // Populate sender info for the response
                await chatMessage.populate('sender', 'name avatar');

                const messageData = {
                    _id: chatMessage._id,
                    sender: chatMessage.sender,
                    receiver: receiverId,
                    message: chatMessage.message,
                    read: chatMessage.read,
                    createdAt: chatMessage.createdAt
                };

                // Send to receiver's room
                io.to(receiverId).emit('chat:receive', messageData);

                // Confirm to sender
                socket.emit('chat:sent', messageData);
            } catch (error) {
                console.error('Chat send error:', error);
                socket.emit('chat:error', { message: 'Failed to send message' });
            }
        });

        /**
         * chat:typing - Notify the other user that this user is typing
         * Payload: { receiverId: string }
         */
        socket.on('chat:typing', (data) => {
            if (data.receiverId) {
                io.to(data.receiverId).emit('chat:typing', {
                    userId,
                    name: socket.user.name
                });
            }
        });

        /**
         * chat:stop-typing - Notify the other user that this user stopped typing
         */
        socket.on('chat:stop-typing', (data) => {
            if (data.receiverId) {
                io.to(data.receiverId).emit('chat:stop-typing', { userId });
            }
        });

        /**
         * chat:read - Mark messages from a user as read
         * Payload: { senderId: string }
         */
        socket.on('chat:read', async (data) => {
            try {
                if (data.senderId) {
                    await ChatMessage.updateMany(
                        { sender: data.senderId, receiver: userId, read: false },
                        { read: true }
                    );
                    // Notify the other user that their messages were read
                    io.to(data.senderId).emit('chat:messages-read', { readBy: userId });
                }
            } catch (error) {
                console.error('Chat read error:', error);
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
