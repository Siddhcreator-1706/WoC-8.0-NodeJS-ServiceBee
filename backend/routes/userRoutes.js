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

// Admin and superuser can view users
router.get('/', protect, authorize('admin', 'superuser'), getUsers);
router.get('/:id', protect, authorize('admin', 'superuser'), getUserById);

// Superuser only for modifications
router.put('/:id', protect, authorize('superuser'), updateUserRole);
router.put('/:id/reactivate', protect, authorize('superuser'), reactivateUser);
router.delete('/:id', protect, authorize('superuser'), deleteUser);

module.exports = router;
