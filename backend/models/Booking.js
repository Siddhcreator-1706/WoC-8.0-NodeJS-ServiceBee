const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    date: {
        type: Date,
        required: [true, 'Please select a date for the service']
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    notes: {
        type: String,
        maxlength: 500
    },
    address: { // Store address snapshot in case user moves
        type: String
    }
}, {
    timestamps: true
});

// Indexes
bookingSchema.index({ user: 1, service: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
