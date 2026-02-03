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

// Public routes
router.get('/', getCompanies);
router.get('/:id', getCompanyById);

// Protected routes
router.get('/user/me', protect, getMyCompany);
router.post('/', protect, authorize('admin', 'superuser'), createCompany);
router.put('/:id', protect, updateCompany);
router.post('/:id/logo', protect, uploadLogo);
router.delete('/:id', protect, deleteCompany);

// Superuser only
router.put('/:id/verify', protect, authorize('superuser'), verifyCompany);

module.exports = router;
