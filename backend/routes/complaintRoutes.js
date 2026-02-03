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
    getComplaintStats
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

// User routes
router.post('/', protect, createComplaint);
router.get('/me', protect, getMyComplaints);

// Service provider routes (admin/superuser who created services)
router.get('/my-services', protect, authorize('admin', 'superuser'), getServiceProviderComplaints);
router.put('/:id/respond', protect, authorize('admin', 'superuser'), serviceProviderRespond);

// Admin routes
router.get('/', protect, authorize('admin', 'superuser'), getAllComplaints);
router.get('/stats', protect, authorize('admin', 'superuser'), getComplaintStats);
router.put('/:id', protect, authorize('admin', 'superuser'), updateComplaintStatus);

// Superuser only
router.delete('/:id', protect, authorize('superuser'), deleteComplaint);

module.exports = router;
