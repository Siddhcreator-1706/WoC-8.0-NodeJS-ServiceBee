const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Company = require('../models/Company');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = async (req, res) => {
    try {
        const { serviceId, companyId, date, notes, address } = req.body;

        if (!serviceId || !date) {
            return res.status(400).json({ message: 'Service and date are required' });
        }

        // Verify service exists and is active
        const service = await Service.findById(serviceId);
        if (!service || service.isActive === false) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Validate provided companyId (if any) matches the service's company
        if (companyId && companyId.toString() !== service.company?.toString()) {
            return res.status(400).json({ message: 'Invalid company for this service' });
        }

        const bookingDate = new Date(date);
        if (Number.isNaN(bookingDate.getTime())) {
            return res.status(400).json({ message: 'Please select a valid date for the service' });
        }

        const booking = await Booking.create({
            user: req.user.id,
            company: service.company, // Securely derived from service
            service: serviceId,
            date: bookingDate,
            notes,
            address: address || req.user.city // Default to user city if not provided
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bookings for current user (customer)
// @route   GET /api/bookings/my-bookings
// @access  Private (User)
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('company', 'name logo phone')
            .populate('service', 'name price')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bookings for a company (provider)
// @route   GET /api/bookings/company-bookings
// @access  Private (Provider)
// @desc    Get bookings for a company (provider)
// @route   GET /api/bookings/company-bookings
// @access  Private (Provider)
const getCompanyBookings = async (req, res) => {
    try {
        // Find company owned by user
        const company = await Company.findOne({ owner: req.user.id });

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const bookings = await Booking.find({ company: company._id })
            .populate('user', 'name phone email city')
            .populate('service', 'name price')
            .sort({ date: 1 }); // Sort by service date

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

        res.json(sanitizedBookings);
    } catch (error) {
        console.error('Error in getCompanyBookings:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status (Accept/Reject/Complete)
// @route   PUT /api/bookings/:id
// @access  Private (Provider)
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify ownership (User owns company which owns booking)
        const company = await Company.findOne({ owner: req.user.id });
        if (!company || booking.company.toString() !== company._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        booking.status = status;
        await booking.save();

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getCompanyBookings,
    updateBookingStatus
};
