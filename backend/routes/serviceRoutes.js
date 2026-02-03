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
    rateService
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getServices);
router.get('/featured', getFeaturedServices);
router.get('/locations', getLocations);
router.get('/:id', getServiceById);

// Protected routes
router.post('/:id/rate', protect, rateService);

// Admin/Superuser routes
router.post('/', protect, authorize('admin', 'superuser'), createService);
router.post('/:id/image', protect, authorize('admin', 'superuser'), uploadImage);
router.put('/:id', protect, authorize('admin', 'superuser'), updateService);
router.delete('/:id', protect, authorize('superuser'), deleteService);

module.exports = router;
