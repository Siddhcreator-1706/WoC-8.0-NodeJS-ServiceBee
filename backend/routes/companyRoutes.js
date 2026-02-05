const express = require('express');
const router = express.Router();
const {
    createCompany,
    getCompanies,
    getCompanyById,
    getMyCompany,
    updateCompany,
    uploadLogo,
    deleteCompany,
    verifyCompany
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadCompanyLogoMiddleware } = require('../config/cloudinary');

// Public routes
router.get('/', getCompanies);

// Protected routes
router.get('/me', protect, getMyCompany); // Moved up to match /me before /:id
router.get('/:id', getCompanyById);

router.post('/', protect, authorize('admin', 'provider'), createCompany); // Allow providers to create company
router.put('/:id', protect, uploadCompanyLogoMiddleware, updateCompany);
router.post('/:id/logo', protect, uploadLogo);
router.delete('/:id', protect, deleteCompany);

// Admin only
router.put('/:id/verify', protect, authorize('admin'), verifyCompany);

module.exports = router;
