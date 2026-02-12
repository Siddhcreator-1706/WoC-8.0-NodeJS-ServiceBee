const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get list of conversations (users the current user has chatted with)
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Find all unique users this user has chatted with
    const conversations = await ChatMessage.aggregate([
        {
            $match: {
                $or: [{ sender: userId }, { receiver: userId }]
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: {
                    $cond: [
                        { $eq: ['$sender', userId] },
                        '$receiver',
                        '$sender'
                    ]
                },
                lastMessage: { $first: '$message' },
                lastMessageAt: { $first: '$createdAt' },
                unreadCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$receiver', userId] },
                                    { $eq: ['$read', false] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $sort: { lastMessageAt: -1 }
        }
    ]);

    // Populate user details
    const populatedConversations = await User.populate(conversations, {
        path: '_id',
        select: 'name avatar role email'
    });

    const result = populatedConversations.map(conv => ({
        user: conv._id,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadCount
    }));

    res.json(result);
});

// @desc    Get chat history with a specific user (paginated)
// @route   GET /api/chat/history/:userId
// @access  Private
const getChatHistory = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;
    const { page = 1, limit = 50 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [messages, total] = await Promise.all([
        ChatMessage.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        })
            .populate('sender', 'name avatar')
            .populate('receiver', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        ChatMessage.countDocuments({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        })
    ]);

    res.json({
        messages: messages.reverse(), // Return in chronological order
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
    });
});

// @desc    Mark messages from a specific user as read
// @route   PUT /api/chat/read/:userId
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;
    const senderId = req.params.userId;

    const result = await ChatMessage.updateMany(
        { sender: senderId, receiver: currentUserId, read: false },
        { read: true }
    );

    res.json({
        message: 'Messages marked as read',
        modifiedCount: result.modifiedCount
    });
});

// @desc    Get list of admin users (for users to initiate chat)
// @route   GET /api/chat/admins
// @access  Private
const getAdmins = asyncHandler(async (req, res) => {
    const admins = await User.find({ role: 'admin', isActive: true })
        .select('name avatar email');

    res.json(admins);
});

module.exports = {
    getConversations,
    getChatHistory,
    markAsRead,
    getAdmins
};
