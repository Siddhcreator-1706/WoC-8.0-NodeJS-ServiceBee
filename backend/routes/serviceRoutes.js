const express = require('express');
const router = express.Router();
const {
    getServices,
    getFeaturedServices,
    getLocations,
    getServiceById,
    createService,
    uploadImage,
    updateService,
    deleteService,
    rateService,
    getMyReviews
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getServices);
router.get('/featured', getFeaturedServices);
router.get('/locations', getLocations);
router.get('/my-reviews', protect, getMyReviews);
router.get('/:id', getServiceById);

// Protected routes
router.post('/:id/rate', protect, rateService);

// Admin routes
router.post('/', protect, authorize('admin', 'provider'), createService);
router.post('/:id/image', protect, authorize('admin', 'provider'), uploadImage);
router.put('/:id', protect, authorize('admin', 'provider'), updateService);
router.delete('/:id', protect, authorize('admin', 'provider'), deleteService);

module.exports = router;
