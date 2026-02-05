const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createBooking,
    getMyBookings,
    getCompanyBookings,
    updateBookingStatus
} = require('../controllers/bookingController');

// All routes are protected
router.use(protect);

router.post('/', createBooking); // Create booking
router.get('/my-bookings', getMyBookings); // Customer bookings
router.get('/company-bookings', authorize('provider'), getCompanyBookings); // Provider bookings
router.put('/:id', authorize('provider'), updateBookingStatus); // Accept/Reject

module.exports = router;
