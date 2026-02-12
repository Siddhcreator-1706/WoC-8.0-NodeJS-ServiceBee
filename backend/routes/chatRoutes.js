const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getConversations,
    getChatHistory,
    markAsRead,
    getAdmins
} = require('../controllers/chatController');

// All routes require authentication
router.use(protect);

router.get('/conversations', getConversations);
router.get('/admins', getAdmins);
router.get('/history/:userId', getChatHistory);
router.put('/read/:userId', markAsRead);

module.exports = router;
