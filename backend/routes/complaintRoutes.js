const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getMyComplaints,
    getServiceProviderComplaints,
    serviceProviderRespond,
    getAllComplaints,
    updateComplaintStatus,
    deleteComplaint,
    getComplaintStats,
    userResolveComplaint
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

// User routes
router.post('/', protect, createComplaint);
router.get('/me', protect, getMyComplaints);
router.put('/:id/resolve', protect, userResolveComplaint);

// Service provider routes (admin who created services)
router.get('/my-services', protect, authorize('provider', 'admin'), getServiceProviderComplaints);
router.put('/:id/respond', protect, authorize('provider', 'admin'), serviceProviderRespond);

// Admin routes
router.get('/', protect, authorize('admin'), getAllComplaints);
router.get('/stats', protect, authorize('admin'), getComplaintStats);
router.put('/:id', protect, authorize('admin'), updateComplaintStatus);

// Admin only
router.delete('/:id', protect, authorize('admin'), deleteComplaint);

module.exports = router;
