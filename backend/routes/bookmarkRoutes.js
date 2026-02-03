const express = require('express');
const router = express.Router();
const {
    addBookmark,
    removeBookmark,
    getMyBookmarks,
    checkBookmark
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.post('/', addBookmark);
router.get('/', getMyBookmarks);
router.get('/check/:serviceId', checkBookmark);
router.delete('/:serviceId', removeBookmark);

module.exports = router;
