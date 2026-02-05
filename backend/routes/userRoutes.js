const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    reactivateUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Admin can view users
router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUserById);

// Admin only for modifications
router.put('/:id', protect, authorize('admin'), updateUserRole);
router.put('/:id/reactivate', protect, authorize('admin'), reactivateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
