const User = require('../models/User');
const Service = require('../models/Service');
const Company = require('../models/Company');
const Complaint = require('../models/Complaint');
const Booking = require('../models/Booking');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (_req, res) => {
    try {
        const [
            userCount,
            providerCount,
            serviceCount,
            companyCount,
            complaintTotal,
            complaintPending,
            bookingTotal,
            revenueTotal,
            recentBookings,
            recentComplaints,
            recentUsers,
            recentCompanies
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'provider' }),
            Service.countDocuments(),
            Company.countDocuments(),
            Complaint.countDocuments(),
            Complaint.countDocuments({ status: 'pending' }),
            Booking.countDocuments(),
            Booking.aggregate([
                { $match: { status: 'completed' } },
                { $lookup: { from: 'services', localField: 'service', foreignField: '_id', as: 'serviceDetails' } },
                { $unwind: '$serviceDetails' },
                { $group: { _id: null, total: { $sum: '$serviceDetails.price' } } }
            ]),
            Booking.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('user', 'name')
                .populate('service', 'name'),
            Complaint.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('user', 'name'),
            User.find({ role: 'user' })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name createdAt'),
            Company.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name createdAt')
        ]);

        const revenue = revenueTotal.length > 0 ? revenueTotal[0].total : 0;

        const activities = [
            ...recentBookings.map(b => ({
                id: b._id,
                user: b.user?.name || 'Unknown User',
                action: `Booked ${b.service?.name || 'a service'}`,
                time: b.createdAt,
                type: 'booking'
            })),
            ...recentComplaints.map(c => ({
                id: c._id,
                user: c.user?.name || 'Unknown User',
                action: `Reported an issue: ${c.subject}`,
                time: c.createdAt,
                type: 'complaint'
            })),
            ...recentUsers.map(u => ({
                id: u._id,
                user: u.name,
                action: 'Joined the platform',
                time: u.createdAt,
                type: 'user_signup'
            })),
            ...recentCompanies.map(c => ({
                id: c._id,
                user: c.name,
                action: 'Registered a new company',
                time: c.createdAt,
                type: 'company_registered'
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: userCount + providerCount,
                    customers: userCount,
                    providers: providerCount
                },
                services: {
                    total: serviceCount
                },
                companies: {
                    total: companyCount
                },
                complaints: {
                    total: complaintTotal,
                    pending: complaintPending
                },
                bookings: {
                    total: bookingTotal
                },
                revenue: {
                    total: revenue
                },
                recentActivity: activities
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error fetching stats'
        });
    }
};

module.exports = {
    getAdminStats
};
