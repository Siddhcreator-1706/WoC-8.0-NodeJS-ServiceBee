const Bookmark = require('../models/Bookmark');

// @desc    Add bookmark
// @route   POST /api/bookmarks
// @access  Private
const addBookmark = async (req, res) => {
    try {
        const { serviceId } = req.body;

        // Check if already bookmarked
        const existing = await Bookmark.findOne({ user: req.user._id, service: serviceId });
        if (existing) {
            return res.status(400).json({ message: 'Already bookmarked' });
        }

        const bookmark = await Bookmark.create({
            user: req.user._id,
            service: serviceId
        });

        res.status(201).json(bookmark);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove bookmark
// @route   DELETE /api/bookmarks/:serviceId
// @access  Private
const removeBookmark = async (req, res) => {
    try {
        const bookmark = await Bookmark.findOneAndDelete({
            user: req.user._id,
            service: req.params.serviceId
        });

        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        res.json({ message: 'Bookmark removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my bookmarks
// @route   GET /api/bookmarks
// @access  Private
const getMyBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ user: req.user._id })
            .populate('service')
            .sort('-createdAt');
        res.json(bookmarks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check if bookmarked
// @route   GET /api/bookmarks/check/:serviceId
// @access  Private
const checkBookmark = async (req, res) => {
    try {
        const bookmark = await Bookmark.findOne({
            user: req.user._id,
            service: req.params.serviceId
        });
        res.json({ isBookmarked: !!bookmark });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addBookmark,
    removeBookmark,
    getMyBookmarks,
    checkBookmark
};
