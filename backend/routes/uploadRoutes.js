const express = require('express');
const router = express.Router();
const { uploadCompanyLogoMiddleware, uploadServiceImageMiddleware, uploadUserAvatarMiddleware } = require('../config/cloudinary');

// @desc    Upload company logo
// @route   POST /api/upload/logo
// @access  Public
router.post('/logo', uploadCompanyLogoMiddleware, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }
        res.json({ url: req.file.secure_url || req.file.path });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Upload user avatar
// @route   POST /api/upload/avatar
// @access  Public
router.post('/avatar', uploadUserAvatarMiddleware, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }
        res.json({ url: req.file.secure_url || req.file.path });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
