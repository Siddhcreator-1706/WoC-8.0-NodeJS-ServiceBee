const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Company = require('../models/Company');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { getIO } = require('../socket/emitter');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = asyncHandler(async (req, res) => {
    const { serviceId, companyId, date, notes, address } = req.body;

    if (!serviceId || !date) {
        throw new AppError('Service and date are required', 400);
    }

    // Verify service exists and is active
    const service = await Service.findById(serviceId);
    if (!service || service.isActive === false) {
        throw new AppError('Service not found', 404);
    }

    // Validate provided companyId (if any) matches the service's company
    if (companyId && companyId.toString() !== service.company?.toString()) {
        throw new AppError('Invalid company for this service', 400);
    }

    const bookingDate = new Date(date);
    if (Number.isNaN(bookingDate.getTime())) {
        throw new AppError('Please select a valid date for the service', 400);
    }

    const booking = await Booking.create({
        user: req.user.id,
        company: service.company, // Securely derived from service
        service: serviceId,
        date: bookingDate,
        notes,
        address: address || req.user.city // Default to user city if not provided
    });

    // Emit real-time event to provider
    const io = getIO();
    if (io && service.createdBy) {
        io.to(service.createdBy.toString()).emit('booking:new', {
            booking,
            userName: req.user.name
        });
    }

    res.status(201).json(booking);
});

// @desc    Get bookings for current user (customer)
// @route   GET /api/bookings/my-bookings
// @access  Private (User)
const getMyBookings = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
        Booking.find({ user: req.user.id })
            .populate('company', 'name logo phone')
            .populate('service', 'name price')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Booking.countDocuments({ user: req.user.id })
    ]);

    res.json({
        bookings,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
    });
});

// @desc    Get bookings for a company (provider)
// @route   GET /api/bookings/company-bookings
// @access  Private (Provider)
const getCompanyBookings = asyncHandler(async (req, res) => {
    // Find company owned by user
    const company = await Company.findOne({ owner: req.user.id });

    if (!company) {
        throw new AppError('Company not found', 404);
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
        Booking.find({ company: company._id })
            .populate('user', 'name phone email city')
            .populate('service', 'name price')
            .sort({ date: 1 })
            .skip(skip)
            .limit(Number(limit)),
        Booking.countDocuments({ company: company._id })
    ]);

    // Privacy: Redact user contact info if booking is pending
    const sanitizedBookings = bookings.map(b => {
        const bookingObj = b.toObject();
        if (bookingObj.status === 'pending' && bookingObj.user) {
            bookingObj.user.phone = '🔒 Hidden (Accept to view)';
            bookingObj.user.email = '🔒 Hidden (Accept to view)';
            bookingObj.address = '🔒 Hidden (Accept to view)';
        }
        return bookingObj;
    });

    res.json({
        bookings: sanitizedBookings,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
    });
});

// @desc    Update booking status (Accept/Reject/Complete)
// @route   PUT /api/bookings/:id
// @access  Private (Provider)
const updateBookingStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        throw new AppError('Booking not found', 404);
    }

    // Verify ownership (User owns company which owns booking)
    const company = await Company.findOne({ owner: req.user.id });
    if (!company || booking.company.toString() !== company._id.toString()) {
        throw new AppError('Not authorized', 401);
    }

    booking.status = status;
    await booking.save();

    // Emit real-time update to the customer
    const io = getIO();
    if (io) {
        io.to(booking.user.toString()).emit('booking:updated', {
            bookingId: booking._id,
            status: booking.status
        });
    }

    // Populate fields before returning so frontend doesn't lose data
    await booking.populate('user', 'name phone email city');
    await booking.populate('service', 'name price');

    res.json(booking);
});

// @desc    Cancel a booking (by the customer)
// @route   PUT /api/bookings/:id/cancel
// @access  Private (User)
const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        throw new AppError('Booking not found', 404);
    }

    // Only the booking owner can cancel
    if (booking.user.toString() !== req.user.id) {
        throw new AppError('Not authorized', 401);
    }

    // Can only cancel pending bookings
    if (booking.status !== 'pending') {
        throw new AppError('Only pending bookings can be cancelled', 400);
    }

    booking.status = 'cancelled';
    await booking.save();

    // Notify the provider
    const io = getIO();
    if (io) {
        const service = await Service.findById(booking.service);
        if (service && service.createdBy) {
            io.to(service.createdBy.toString()).emit('booking:cancelled', {
                bookingId: booking._id,
                userName: req.user.name
            });
        }
    }

    res.json(booking);
});

module.exports = {
    createBooking,
    getMyBookings,
    getCompanyBookings,
    updateBookingStatus,
    cancelBooking
};
