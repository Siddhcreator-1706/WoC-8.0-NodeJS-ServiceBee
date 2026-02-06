const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    reactivateUser,
    updateUserProfile,
    updateUserPassword
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// User Profile Routes (Self-serve) - MUST BE BEFORE /:id
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updateUserPassword);

// Admin can view users
router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUserById);

// Admin only for modifications
router.put('/:id', protect, authorize('admin'), updateUserRole);
router.put('/:id/reactivate', protect, authorize('admin'), reactivateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
