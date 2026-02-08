const express = require('express');
const router = express.Router();
const {
    registerUser,
    verifyOTP,
    resendOTP,
    loginUser,
    logoutUser,
    logoutAll,
    getMe,
    updateProfile,
    forgotPassword,
    verifyResetOTP,
    resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/logout-all', protect, logoutAll);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
