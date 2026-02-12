/**
 * Socket.IO emitter helper.
 * Stores the io instance so controllers can emit events
 * without circular imports.
 */
let io;

const setIO = (ioInstance) => {
    io = ioInstance;
};

const getIO = () => {
    if (!io) {
        console.warn('Socket.IO not initialized yet — event not emitted');
        return null;
    }
    return io;
};

module.exports = { setIO, getIO };
